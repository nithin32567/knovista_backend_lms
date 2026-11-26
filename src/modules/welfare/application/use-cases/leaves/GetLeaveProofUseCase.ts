import { PrismaClient } from '@prisma/client';
import { isBatchScopedRole, getAssignedStudentIdsForStaff } from '../../services/WelfareAccessService';
import { ForbiddenError } from '../../../../../shared/errors/ForbiddenError';
import { AuthenticatedUser } from '../../../../../shared/types/jwt';
import path from 'path';
import fs from 'fs';
import { IStudentLeaveRepository } from '../../../domain/repositories/IStudentLeaveRepository';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export interface LeaveProofResult {
  filePath: string;
  mimeType: string;
}

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export class GetLeaveProofUseCase {
  constructor(
    private readonly leaveRepository: IStudentLeaveRepository,
    private readonly prisma?: PrismaClient,
  ) {}

  async execute(leaveId: number, user?: AuthenticatedUser): Promise<LeaveProofResult> {
    const leave = await this.leaveRepository.findById(leaveId);

    if (!leave || leave.status === 'deleted' || !leave.proof) {
      throw new NotFoundError('Proof not found for this leave request');
    }

    const ownsProof = user?.type === 'student' && user.id === leave.studentId;
    const canManage = user?.type === 'institution_user' && ['Admin', 'Team Lead'].includes(user.role ?? '');
    const canReview = user?.type === 'institution_user' && this.prisma && isBatchScopedRole(user.role)
      && (await getAssignedStudentIdsForStaff(this.prisma, user.id, user.role)).includes(leave.studentId);
    if (!ownsProof && !canManage && !canReview) {
      throw new ForbiddenError('Leave proof access denied');
    }

    const uploadsDir = path.resolve(process.cwd(), 'uploads', 'leaves');
    const cleanRelativePath = leave.proof.replace(/^public\//, '');
    if (path.dirname(cleanRelativePath) !== 'leaves') {
      throw new NotFoundError('Proof file no longer exists on disk');
    }
    const filePath = path.resolve(uploadsDir, path.basename(cleanRelativePath));

    if (!filePath.startsWith(`${uploadsDir}${path.sep}`) || !fs.existsSync(filePath)) {
      throw new NotFoundError('Proof file no longer exists on disk');
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_MAP[ext] ?? 'application/octet-stream';

    return { filePath, mimeType };
  }
}
