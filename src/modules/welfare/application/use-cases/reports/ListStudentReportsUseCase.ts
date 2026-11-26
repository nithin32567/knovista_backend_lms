import { PrismaClient } from '@prisma/client';
import { IStudentReportRepository, ListReportsFilters } from '../../../domain/repositories/IStudentReportRepository';
import { StudentReport } from '../../../domain/entities/StudentReport';
import { StudentReportResponseDTO } from '../../dto/StudentReportDTO';
import { ForbiddenError } from '../../../../../shared/errors/ForbiddenError';
import {
  isBatchScopedRole,
  getAssignedStudentIdsForStaff,
  enforceRequestedStudentScope,
} from '../../services/WelfareAccessService';

interface AuthenticatedUser {
  id: number;
  type: 'student' | 'institution_user';
  role?: string | undefined;
}

export class ListStudentReportsUseCase {
  constructor(
    private readonly reportRepository: IStudentReportRepository,
    private readonly prisma: PrismaClient,
  ) {}

  async execute(
    user: AuthenticatedUser,
    filters: ListReportsFilters,
  ): Promise<StudentReportResponseDTO[]> {
    let reports: StudentReport[];

    if (user.role === 'Admin' || user.role === 'Team Lead' || user.role === 'Sales Analyst') {
      reports =
        filters.studentId !== undefined
          ? await this.reportRepository.findByStudentIds([filters.studentId], filters)
          : await this.reportRepository.findAll(filters);
    } else if (isBatchScopedRole(user.role)) {
      const allowedIds = await getAssignedStudentIdsForStaff(this.prisma, user.id, user.role);
      const scopedIds = enforceRequestedStudentScope(allowedIds, filters.studentId);
      if (scopedIds.length === 0) {
        return [];
      }
      reports = await this.reportRepository.findByStudentIds(scopedIds, filters);
    } else {
      throw new ForbiddenError('Unauthorized access');
    }

    const enriched = await this.enrichReports(reports);

    if (filters.role) {
      const roleFilter = filters.role.toLowerCase();
      return enriched.filter((item) => item.created_by?.role?.toLowerCase() === roleFilter);
    }

    return enriched;
  }

  private async enrichReports(reports: StudentReport[]): Promise<StudentReportResponseDTO[]> {
    if (reports.length === 0) {
      return [];
    }

    const studentIds = [...new Set(reports.map((r) => BigInt(r.studentId)))];
    const headIds = [
      ...new Set(
        reports
          .map((r) => r.reportHeadId)
          .filter((id): id is number => id !== null)
          .map((id) => BigInt(id)),
      ),
    ];
    const creatorIds = [
      ...new Set(
        reports
          .map((r) => r.createdBy)
          .filter((id): id is number => id !== null)
          .map((id) => BigInt(id)),
      ),
    ];

    const [students, heads, creators] = await Promise.all([
      this.prisma.students.findMany({
        where: { id: { in: studentIds } },
        select: { id: true, first_name: true, last_name: true, email: true, mobile_no: true },
      }),
      headIds.length > 0
        ? this.prisma.student_report_heads.findMany({
            where: { id: { in: headIds } },
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
      creatorIds.length > 0
        ? this.prisma.institution_users.findMany({
            where: { id: { in: creatorIds } },
            select: { id: true, first_name: true, last_name: true, email: true, mobile_no: true, role: true },
          })
        : Promise.resolve([]),
    ]);

    const studentMap = new Map(students.map((s) => [Number(s.id), s]));
    const headMap = new Map(heads.map((h) => [Number(h.id), h.name]));
    const creatorMap = new Map(creators.map((c) => [Number(c.id), c]));

    return reports.map((report) => {
      const student = studentMap.get(report.studentId);
      const headName = report.reportHeadId !== null ? headMap.get(report.reportHeadId) ?? null : null;
      const creator = report.createdBy !== null ? creatorMap.get(report.createdBy) : undefined;

      return {
        id: report.id,
        student: student
          ? {
              id: Number(student.id),
              first_name: student.first_name,
              last_name: student.last_name,
              email: student.email,
              mobile_no: student.mobile_no,
            }
          : null,
        report_head: headName,
        description: report.description,
        created_by: creator
          ? {
              id: Number(creator.id),
              first_name: creator.first_name,
              last_name: creator.last_name,
              email: creator.email,
              mobile_no: creator.mobile_no,
              role: creator.role?.name ?? null,
            }
          : null,
        created_at: report.createdAt ? report.createdAt.toISOString() : null,
      };
    });
  }
}
