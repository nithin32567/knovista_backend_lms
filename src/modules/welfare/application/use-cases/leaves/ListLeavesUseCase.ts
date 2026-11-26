import { PrismaClient } from '@prisma/client';
import { IStudentLeaveRepository, ListLeavesFilters } from '../../../domain/repositories/IStudentLeaveRepository';
import { StudentLeave } from '../../../domain/entities/StudentLeave';
import { StudentLeaveResponseDTO } from '../../dto/StudentLeaveDTO';
import { ForbiddenError } from '../../../../../shared/errors/ForbiddenError';
import { env } from '../../../../../config/env';
import {
  isBatchScopedRole,
  getAssignedStudentIdsForStaff,
  getStudentIdsCreatedByUser,
  enforceRequestedStudentScope,
} from '../../services/WelfareAccessService';

interface AuthenticatedUser {
  id: number;
  type: 'student' | 'institution_user';
  role?: string | undefined;
}

export class ListLeavesUseCase {
  constructor(
    private readonly leaveRepository: IStudentLeaveRepository,
    private readonly prisma: PrismaClient,
  ) {}

  async execute(
    user: AuthenticatedUser,
    filters: ListLeavesFilters,
  ): Promise<StudentLeaveResponseDTO[]> {
    let leaves: StudentLeave[];

    if (user.type === 'student') {
      if (filters.studentId !== undefined && filters.studentId !== user.id) {
        throw new ForbiddenError('Unauthorized for requested student');
      }
      leaves = await this.leaveRepository.findByStudentId(user.id, filters);
    } else if (user.role === 'Admin' || user.role === 'Team Lead') {
      leaves =
        filters.studentId !== undefined
          ? await this.leaveRepository.findByStudentId(filters.studentId, filters)
          : await this.leaveRepository.findAll(filters);
    } else if (user.role === 'Sales Analyst') {
      const allowedIds = await getStudentIdsCreatedByUser(this.prisma, user.id);
      const scopedIds = enforceRequestedStudentScope(allowedIds, filters.studentId);
      if (scopedIds.length === 0) {
        return [];
      }
      leaves = await this.leaveRepository.findByStudentIds(scopedIds, filters);
    } else if (isBatchScopedRole(user.role)) {
      const allowedIds = await getAssignedStudentIdsForStaff(this.prisma, user.id, user.role);
      const scopedIds = enforceRequestedStudentScope(allowedIds, filters.studentId);
      if (scopedIds.length === 0) {
        return [];
      }
      leaves = await this.leaveRepository.findByStudentIds(scopedIds, filters);
    } else {
      throw new ForbiddenError('Unauthorized access');
    }

    return this.enrichLeaves(leaves);
  }

  private async enrichLeaves(leaves: StudentLeave[]): Promise<StudentLeaveResponseDTO[]> {
    if (leaves.length === 0) {
      return [];
    }

    const studentIds = [...new Set(leaves.map((l) => BigInt(l.studentId)))];
    const staffIds = [
      ...new Set(
        leaves
          .flatMap((l) => [l.authorizedBy, l.createdBy])
          .filter((id): id is number => id !== null)
          .map((id) => BigInt(id)),
      ),
    ];
    const reasonIds = [
      ...new Set(
        leaves
          .map((l) => l.reasonId)
          .filter((id): id is number => id !== null)
          .map((id) => BigInt(id)),
      ),
    ];

    const [students, sections, staffUsers, reasons] = await Promise.all([
      this.prisma.students.findMany({
        where: { id: { in: studentIds } },
        select: { id: true, first_name: true, last_name: true, email: true, mobile_no: true },
      }),
      this.prisma.student_sections.findMany({
        where: { student_id: { in: studentIds } },
        orderBy: { created_at: 'desc' },
        select: {
          student_id: true,
          batch: {
            select: {
              id: true,
              batch_name: true,
              start_date: true,
              end_date: true,
              status: true,
              tutor_id: true,
            },
          },
        },
      }),
      staffIds.length > 0
        ? this.prisma.institution_users.findMany({
            where: { id: { in: staffIds } },
            select: { id: true, first_name: true, last_name: true, email: true, role: true },
          })
        : Promise.resolve([]),
      reasonIds.length > 0
        ? this.prisma.leave_reasons.findMany({
            where: { id: { in: reasonIds } },
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
    ]);

    const studentMap = new Map(students.map((s) => [Number(s.id), s]));
    const batchByStudentMap = new Map<number, (typeof sections)[number]['batch']>();
    for (const sec of sections) {
      const sid = Number(sec.student_id);
      if (!batchByStudentMap.has(sid)) {
        batchByStudentMap.set(sid, sec.batch);
      }
    }
    const staffMap = new Map(staffUsers.map((u) => [Number(u.id), u]));
    const reasonMap = new Map(reasons.map((r) => [Number(r.id), r.name]));

    return leaves.map((leave) => {
      const student = studentMap.get(leave.studentId);
      const rawBatch = batchByStudentMap.get(leave.studentId);
      const authorizer = leave.authorizedBy !== null ? staffMap.get(leave.authorizedBy) : undefined;
      const creator = leave.createdBy !== null ? staffMap.get(leave.createdBy) : undefined;
      const reason = leave.reasonId !== null ? reasonMap.get(leave.reasonId) ?? null : null;
      const proofUrl = leave.proof
        ? `${env.APP_URL}/api/student-leaves/${leave.id}/proof`
        : null;

      return {
        id: leave.id,
        student: student
          ? {
              id: Number(student.id),
              first_name: student.first_name,
              last_name: student.last_name,
              email: student.email,
              mobile_no: student.mobile_no,
            }
          : null,
        batch: rawBatch
          ? {
              id: Number(rawBatch.id),
              name: rawBatch.batch_name,
              batch_type: null,
              batch_start_date: rawBatch.start_date
                ? rawBatch.start_date.toISOString().split('T')[0] ?? null
                : null,
              batch_end_date: rawBatch.end_date
                ? rawBatch.end_date.toISOString().split('T')[0] ?? null
                : null,
              status: rawBatch.status,
              tutor_id: rawBatch.tutor_id ? Number(rawBatch.tutor_id) : null,
            }
          : null,
        start_date: leave.startDate.toISOString().split('T')[0] ?? null,
        end_date: leave.endDate.toISOString().split('T')[0] ?? null,
        no_of_days: leave.noOfDays,
        reason,
        description: leave.description,
        proof: proofUrl,
        status: leave.status,
        authorized_by: authorizer
          ? {
              id: Number(authorizer.id),
              first_name: authorizer.first_name,
              last_name: authorizer.last_name,
              email: authorizer.email,
            }
          : null,
        authorization_remark: leave.authorizationRemark,
        created_by: creator
          ? {
              id: Number(creator.id),
              first_name: creator.first_name,
              last_name: creator.last_name,
              role: creator.role?.name ?? null,
            }
          : null,
        created_at: leave.createdAt ? leave.createdAt.toISOString() : null,
        updated_at: leave.updatedAt ? leave.updatedAt.toISOString() : null,
      };
    });
  }
}
