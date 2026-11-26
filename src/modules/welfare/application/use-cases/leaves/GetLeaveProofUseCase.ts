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
  constructor(private readonly leaveRepository: IStudentLeaveRepository) {}

  async execute(leaveId: number): Promise<LeaveProofResult> {
    const leave = await this.leaveRepository.findById(leaveId);

    if (!leave || leave.status === 'deleted' || !leave.proof) {
      throw new NotFoundError('Proof not found for this leave request');
    }

    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    const cleanRelativePath = leave.proof.replace(/^public\//, '');
    const filePath = path.resolve(uploadsDir, cleanRelativePath);

    if (!filePath.startsWith(`${uploadsDir}${path.sep}`) || !fs.existsSync(filePath)) {
      throw new NotFoundError('Proof file no longer exists on disk');
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_MAP[ext] ?? 'application/octet-stream';

    return { filePath, mimeType };
  }
}
