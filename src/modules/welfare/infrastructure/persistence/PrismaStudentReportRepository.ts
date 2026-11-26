import { PrismaClient, Prisma } from '@prisma/client';
import {
  IStudentReportRepository,
  CreateReportData,
  ListReportsFilters,
} from '../../domain/repositories/IStudentReportRepository';
import { StudentReport } from '../../domain/entities/StudentReport';
import { StudentReportHead } from '../../domain/entities/StudentReportHead';

type PrismaReportRecord = {
  id: bigint;
  student_id: bigint;
  report_head_id: bigint | null;
  description: string | null;
  status: string;
  created_by: bigint | null;
  updated_by: bigint | null;
  created_at: Date | null;
  updated_at: Date | null;
};

type PrismaReportHeadRecord = {
  id: bigint;
  name: string;
  status: string;
  created_by: bigint | null;
  updated_by: bigint | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export class PrismaStudentReportRepository implements IStudentReportRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateReportData): Promise<StudentReport> {
    const record = await this.prisma.student_reports.create({
      data: {
        student_id: BigInt(data.studentId),
        report_head_id: BigInt(data.reportHeadId),
        description: data.description,
        status: 'active',
        created_by: data.createdBy !== null ? BigInt(data.createdBy) : null,
        updated_by: data.updatedBy !== null ? BigInt(data.updatedBy) : null,
      },
    });

    return this.mapReportToDomain(record);
  }

  async findById(id: number): Promise<StudentReport | null> {
    const record = await this.prisma.student_reports.findUnique({
      where: { id: BigInt(id) },
    });

    return record ? this.mapReportToDomain(record) : null;
  }

  async softDelete(id: number, updatedBy: number | null): Promise<void> {
    await this.prisma.student_reports.update({
      where: { id: BigInt(id) },
      data: {
        status: 'deleted',
        updated_by: updatedBy !== null ? BigInt(updatedBy) : null,
        updated_at: new Date(),
      },
    });
  }

  async findAll(filters: ListReportsFilters): Promise<StudentReport[]> {
    const where = this.buildWhereClause(filters);
    const records = await this.prisma.student_reports.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return records.map((r) => this.mapReportToDomain(r));
  }

  async findByStudentIds(studentIds: number[], filters: ListReportsFilters): Promise<StudentReport[]> {
    if (studentIds.length === 0) {
      return [];
    }

    const where = this.buildWhereClause(filters);
    where.student_id = { in: studentIds.map((id) => BigInt(id)) };

    const records = await this.prisma.student_reports.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return records.map((r) => this.mapReportToDomain(r));
  }

  async findActiveHeads(): Promise<StudentReportHead[]> {
    const records = await this.prisma.student_report_heads.findMany({
      where: { status: { not: 'deleted' } },
      orderBy: { name: 'asc' },
    });

    return records.map((r) => this.mapHeadToDomain(r));
  }

  private buildWhereClause(filters: ListReportsFilters): Prisma.student_reportsWhereInput {
    const where: Prisma.student_reportsWhereInput = {
      status: { not: 'deleted' },
    };

    if (filters.studentId !== undefined) {
      where.student_id = BigInt(filters.studentId);
    }
    if (filters.reportHeadId !== undefined) {
      where.report_head_id = BigInt(filters.reportHeadId);
    }

    if (filters.dateFrom !== undefined || filters.dateTo !== undefined) {
      const createdAtFilter: Prisma.DateTimeNullableFilter = {};
      if (filters.dateFrom !== undefined) {
        createdAtFilter.gte = new Date(`${filters.dateFrom}T00:00:00.000Z`);
      }
      if (filters.dateTo !== undefined) {
        createdAtFilter.lte = new Date(`${filters.dateTo}T23:59:59.999Z`);
      }
      where.created_at = createdAtFilter;
    }

    return where;
  }

  private mapReportToDomain(raw: PrismaReportRecord): StudentReport {
    return new StudentReport({
      id: Number(raw.id),
      studentId: Number(raw.student_id),
      reportHeadId: raw.report_head_id ? Number(raw.report_head_id) : null,
      description: raw.description,
      status: raw.status,
      createdBy: raw.created_by ? Number(raw.created_by) : null,
      updatedBy: raw.updated_by ? Number(raw.updated_by) : null,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    });
  }

  private mapHeadToDomain(raw: PrismaReportHeadRecord): StudentReportHead {
    return new StudentReportHead({
      id: Number(raw.id),
      name: raw.name,
      status: raw.status,
      createdBy: raw.created_by ? Number(raw.created_by) : null,
      updatedBy: raw.updated_by ? Number(raw.updated_by) : null,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    });
  }
}
