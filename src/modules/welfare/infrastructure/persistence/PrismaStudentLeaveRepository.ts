import { PrismaClient, Prisma } from '@prisma/client';
import {
  IStudentLeaveRepository,
  CreateLeaveData,
  AuthorizeLeaveData,
  ListLeavesFilters,
} from '../../domain/repositories/IStudentLeaveRepository';
import { StudentLeave } from '../../domain/entities/StudentLeave';

type PrismaLeaveRecord = {
  id: bigint;
  student_id: bigint;
  start_date: Date;
  end_date: Date;
  no_of_days: number | null;
  reason_id: bigint | null;
  description: string | null;
  proof: string | null;
  status: string;
  authorized_by: bigint | null;
  authorization_remark: string | null;
  created_by: bigint | null;
  updated_by: bigint | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export class PrismaStudentLeaveRepository implements IStudentLeaveRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateLeaveData): Promise<StudentLeave> {
    const record = await this.prisma.student_leaves.create({
      data: {
        student_id: BigInt(data.studentId),
        start_date: new Date(`${data.startDate}T00:00:00.000Z`),
        end_date: new Date(`${data.endDate}T00:00:00.000Z`),
        no_of_days: data.noOfDays,
        reason_id: BigInt(data.reasonId),
        description: data.description,
        proof: data.proofPath,
        status: 'pending',
        created_by: data.createdBy !== null ? BigInt(data.createdBy) : null,
        updated_by: data.createdBy !== null ? BigInt(data.createdBy) : null,
      },
    });

    return this.mapToDomain(record);
  }

  async findById(id: number): Promise<StudentLeave | null> {
    const record = await this.prisma.student_leaves.findUnique({
      where: { id: BigInt(id) },
    });

    return record ? this.mapToDomain(record) : null;
  }

  async authorize(id: number, data: AuthorizeLeaveData): Promise<StudentLeave> {
    const record = await this.prisma.student_leaves.update({
      where: { id: BigInt(id) },
      data: {
        status: data.status,
        authorized_by: BigInt(data.authorizedBy),
        authorization_remark: data.authorizationRemark,
        updated_by: BigInt(data.updatedBy),
      },
    });

    return this.mapToDomain(record);
  }

  async findAll(filters: ListLeavesFilters): Promise<StudentLeave[]> {
    const where = this.buildWhereClause(filters);
    const records = await this.prisma.student_leaves.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return records.map((r) => this.mapToDomain(r));
  }

  async findByStudentId(studentId: number, filters: ListLeavesFilters): Promise<StudentLeave[]> {
    const where = this.buildWhereClause({ ...filters, studentId });
    const records = await this.prisma.student_leaves.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return records.map((r) => this.mapToDomain(r));
  }

  async findByStudentIds(studentIds: number[], filters: ListLeavesFilters): Promise<StudentLeave[]> {
    if (studentIds.length === 0) {
      return [];
    }

    const where = this.buildWhereClause(filters);
    where.student_id = { in: studentIds.map((id) => BigInt(id)) };

    const records = await this.prisma.student_leaves.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return records.map((r) => this.mapToDomain(r));
  }

  private buildWhereClause(filters: ListLeavesFilters): Prisma.student_leavesWhereInput {
    const where: Prisma.student_leavesWhereInput = {
      status: { not: 'deleted' },
    };

    if (filters.studentId !== undefined) {
      where.student_id = BigInt(filters.studentId);
    }
    if (filters.reasonId !== undefined) {
      where.reason_id = BigInt(filters.reasonId);
    }
    if (filters.status !== undefined) {
      where.status = filters.status;
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

  private mapToDomain(raw: PrismaLeaveRecord): StudentLeave {
    return new StudentLeave({
      id: Number(raw.id),
      studentId: Number(raw.student_id),
      startDate: raw.start_date,
      endDate: raw.end_date,
      noOfDays: raw.no_of_days,
      reasonId: raw.reason_id ? Number(raw.reason_id) : null,
      description: raw.description,
      proof: raw.proof,
      status: raw.status,
      authorizedBy: raw.authorized_by ? Number(raw.authorized_by) : null,
      authorizationRemark: raw.authorization_remark,
      createdBy: raw.created_by ? Number(raw.created_by) : null,
      updatedBy: raw.updated_by ? Number(raw.updated_by) : null,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    });
  }
}
