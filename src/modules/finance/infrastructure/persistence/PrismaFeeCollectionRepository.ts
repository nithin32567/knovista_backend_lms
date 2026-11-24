import { PrismaClient, Prisma } from '@prisma/client';
import { FeeCollection, FeeStatus, ApprovalStatus } from '../../domain/entities/FeeCollection';
import { FeeCollectionHistory } from '../../domain/entities/FeeCollectionHistory';
import {
  FeeCollectionGroup,
  FeeInstallmentItem,
  FeeStudentInfo,
} from '../../domain/entities/FeeCollectionGroup';
import {
  IFeeCollectionRepository,
  FeeCollectionFilter,
  CreateFeeInstallmentData,
  CollectFeeData,
  ApproveFeeData,
  UpdateInstallmentData,
} from '../../domain/repositories/IFeeCollectionRepository';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';

type FeeCollectionWithHistories = Prisma.fee_collectionsGetPayload<{
  include: { histories: true };
}>;

type FeeCollectionRow = Prisma.fee_collectionsGetPayload<{
  include: { histories: false };
}>;

export class PrismaFeeCollectionRepository implements IFeeCollectionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findGrouped(filter: FeeCollectionFilter): Promise<FeeCollectionGroup[]> {
    const where = this.buildWhereClause(filter);

    const rows = await this.prisma.fee_collections.findMany({
      where,
      include: { histories: true },
      orderBy: [{ due_date: 'asc' }, { installment_no: 'asc' }],
    });

    if (rows.length === 0) {
      return [];
    }

    const studentIds = Array.from(new Set(rows.map((r) => r.student_id)));
    const sectionIds = Array.from(
      new Set(
        rows
          .map((r) => r.student_section_id)
          .filter((id): id is bigint => id !== null),
      ),
    );
    const userIds = Array.from(
      new Set(
        rows
          .flatMap((r) => [r.created_by, r.collected_by, r.auth_by, r.updated_by])
          .filter((id): id is bigint => id !== null),
      ),
    );

    const [students, studentSections, users] = await Promise.all([
      studentIds.length > 0
        ? this.prisma.students.findMany({
            where: { id: { in: studentIds } },
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              mobile_no: true,
              paid_amount: true,
            },
          })
        : [],
      sectionIds.length > 0
        ? this.prisma.student_sections.findMany({
            where: { id: { in: sectionIds } },
            include: {
              batch: {
                include: {
                  section: true,
                },
              },
            },
          })
        : [],
      userIds.length > 0
        ? this.prisma.institution_users.findMany({
            where: { id: { in: userIds } },
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          })
        : [],
    ]);

    const studentMap = new Map(students.map((s) => [s.id.toString(), s]));
    const sectionMap = new Map(
      studentSections.map((ss) => [ss.id.toString(), ss.batch?.section ?? null]),
    );
    const userMap = new Map(
      users.map((u) => [u.id.toString(), `${u.first_name} ${u.last_name}`.trim()]),
    );

    const groupedMap = new Map<string, typeof rows>();
    for (const row of rows) {
      const key = `${row.student_id}_${row.student_section_id?.toString() ?? 'null'}`;
      const list = groupedMap.get(key) ?? [];
      list.push(row);
      groupedMap.set(key, list);
    }

    const now = new Date();
    const result: FeeCollectionGroup[] = [];

    for (const groupRows of groupedMap.values()) {
      const firstRow = groupRows[0];
      if (!firstRow) continue;

      const studentData = studentMap.get(firstRow.student_id.toString());
      const sectionData = firstRow.student_section_id
        ? sectionMap.get(firstRow.student_section_id.toString())
        : null;

      const legacyPaid = studentData ? Number(studentData.paid_amount) : 0;
      const feeAmountTotal = groupRows.reduce((sum, r) => sum + Number(r.fee_amount), 0);
      const feePaidTotal = groupRows.reduce((sum, r) => sum + Number(r.paid_amount), 0);

      const totalAmount = Math.round((legacyPaid + feeAmountTotal) * 100) / 100;
      const paidAmount = Math.round((legacyPaid + feePaidTotal) * 100) / 100;
      const balanceAmount = Math.round(Math.max(totalAmount - paidAmount, 0) * 100) / 100;

      const studentInfo: FeeStudentInfo = {
        id: Number(firstRow.student_id),
        name: studentData ? `${studentData.first_name} ${studentData.last_name}`.trim() : '',
        email: studentData?.email ?? '',
        mobile_no: studentData?.mobile_no ?? '',
        student_paid_amount: paidAmount.toFixed(2),
        student_balance_amount: balanceAmount.toFixed(2),
        section: sectionData
          ? {
              id: Number(sectionData.id),
              name: sectionData.name,
              amount: '0.00',
            }
          : null,
      };

      const installments: FeeInstallmentItem[] = groupRows.map((r) => {
        const isOverdue = r.fee_status === 'pending' && new Date(r.due_date) < now;
        return {
          id: Number(r.id),
          installment_no: r.installment_no,
          fee_amount: Number(r.fee_amount).toFixed(2),
          paid_amount: Number(r.paid_amount).toFixed(2),
          balance_amount: Number(r.balance_amount).toFixed(2),
          due_date: r.due_date.toISOString().split('T')[0] ?? '',
          fee_status: r.fee_status as FeeStatus,
          is_overdue: isOverdue,
          created_by: r.created_by ? Number(r.created_by) : null,
          created_user: r.created_by ? userMap.get(r.created_by.toString()) ?? null : null,
          collected_by: r.collected_by ? Number(r.collected_by) : null,
          collected_user: r.collected_by ? userMap.get(r.collected_by.toString()) ?? null : null,
          collected_at: r.collected_at ? r.collected_at.toISOString() : null,
          approval_status: r.approval_status as ApprovalStatus,
          auth_by: r.auth_by ? Number(r.auth_by) : null,
          auth_user: r.auth_by ? userMap.get(r.auth_by.toString()) ?? null : null,
          auth_at: r.auth_at ? r.auth_at.toISOString() : null,
          auth_remark: r.auth_remark,
          created_at: r.created_at ? r.created_at.toISOString() : null,
          updated_at: r.updated_at ? r.updated_at.toISOString() : null,
        };
      });

      result.push(
        new FeeCollectionGroup(
          Number(firstRow.student_id),
          firstRow.student_section_id ? Number(firstRow.student_section_id) : null,
          totalAmount,
          paidAmount,
          balanceAmount,
          balanceAmount,
          studentInfo,
          installments,
        ),
      );
    }

    return result;
  }

  async findAll(filter: FeeCollectionFilter): Promise<FeeCollection[]> {
    const where = this.buildWhereClause(filter);

    const rows = await this.prisma.fee_collections.findMany({
      where,
      include: { histories: true },
      orderBy: [{ student_id: 'asc' }, { installment_no: 'asc' }],
    });

    return rows.map((row) => this.mapToEntity(row));
  }

  async findById(id: number): Promise<FeeCollection | null> {
    const row = await this.prisma.fee_collections.findUnique({
      where: { id: BigInt(id) },
      include: { histories: true },
    });

    if (!row) return null;

    return this.mapToEntity(row);
  }

  async createMany(installments: CreateFeeInstallmentData[]): Promise<FeeCollection[]> {
    const created: FeeCollection[] = [];

    for (const inst of installments) {
      const row = await this.prisma.fee_collections.create({
        data: {
          student_id: BigInt(inst.studentId),
          student_section_id: inst.studentSectionId ? BigInt(inst.studentSectionId) : null,
          installment_no: inst.installmentNo,
          fee_amount: new Prisma.Decimal(inst.feeAmount),
          paid_amount: new Prisma.Decimal(0),
          balance_amount: new Prisma.Decimal(inst.feeAmount),
          due_date: inst.dueDate,
          fee_status: 'pending',
          approval_status: 'pending',
          created_by: BigInt(inst.createdBy),
          updated_by: BigInt(inst.createdBy),
        },
        include: { histories: true },
      });

      created.push(this.mapToEntity(row));
    }

    return created;
  }

  async collectFee(id: number, data: CollectFeeData): Promise<FeeCollection> {
    const existing = await this.prisma.fee_collections.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existing) {
      throw new NotFoundError('Fee collection record not found');
    }

    const currentPaid = Number(existing.paid_amount) + data.paidAmount;
    const feeAmount = Number(existing.fee_amount);
    const balanceAmount = Math.max(0, feeAmount - currentPaid);

    let newFeeStatus: string;
    if (currentPaid >= feeAmount) {
      newFeeStatus = 'collected';
    } else if (currentPaid > 0) {
      newFeeStatus = 'partial';
    } else {
      newFeeStatus = 'pending';
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.fee_collections.update({
        where: { id: BigInt(id) },
        data: {
          paid_amount: new Prisma.Decimal(currentPaid),
          balance_amount: new Prisma.Decimal(balanceAmount),
          fee_status: newFeeStatus,
          approval_status: 'pending',
          collected_by: BigInt(data.collectedById),
          collected_at: data.collectedAt,
          updated_by: BigInt(data.collectedById),
        },
        include: { histories: true },
      }),
      this.prisma.fee_collection_histories.create({
        data: {
          fee_collection_id: BigInt(id),
          paid_amount: new Prisma.Decimal(data.paidAmount),
          collected_by: BigInt(data.collectedById),
          collected_at: data.collectedAt,
          record_status: 'active',
        },
      }),
    ]);

    return this.mapToEntity(updated);
  }

  async approveFee(id: number, data: ApproveFeeData): Promise<FeeCollection> {
    const row = await this.prisma.fee_collections.update({
      where: { id: BigInt(id) },
      data: {
        approval_status: data.approvalStatus,
        auth_by: BigInt(data.authById),
        auth_at: data.authAt,
        auth_remark: data.authRemark ?? null,
        updated_by: BigInt(data.authById),
      },
      include: { histories: true },
    });

    return this.mapToEntity(row);
  }

  async updateInstallment(id: number, data: UpdateInstallmentData): Promise<FeeCollection> {
    const updateData: Prisma.fee_collectionsUpdateInput = {
      updated_by: BigInt(data.updatedBy),
    };

    if (data.feeAmount !== undefined) {
      updateData.fee_amount = new Prisma.Decimal(data.feeAmount);
      updateData.balance_amount = new Prisma.Decimal(data.feeAmount);
    }

    if (data.dueDate !== undefined) {
      updateData.due_date = data.dueDate;
    }

    const row = await this.prisma.fee_collections.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: { histories: true },
    });

    return this.mapToEntity(row);
  }

  async deleteInstallment(id: number): Promise<void> {
    await this.prisma.fee_collections.delete({
      where: { id: BigInt(id) },
    });
  }

  async cancelFee(id: number, updatedBy: number): Promise<FeeCollection> {
    const row = await this.prisma.fee_collections.update({
      where: { id: BigInt(id) },
      data: {
        fee_status: 'cancelled',
        updated_by: BigInt(updatedBy),
      },
      include: { histories: true },
    });

    return this.mapToEntity(row);
  }

  private buildWhereClause(filter: FeeCollectionFilter): Prisma.fee_collectionsWhereInput {
    const where: Prisma.fee_collectionsWhereInput = {};

    if (filter.studentId !== undefined) {
      where.student_id = BigInt(filter.studentId);
    }

    if (filter.studentSectionId !== undefined) {
      where.student_section_id = BigInt(filter.studentSectionId);
    }

    if (filter.feeStatus !== undefined) {
      where.fee_status = filter.feeStatus;
    }

    if (filter.approvalStatus !== undefined) {
      where.approval_status = filter.approvalStatus;
    }

    if (filter.dateFrom !== undefined || filter.dateTo !== undefined) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (filter.dateFrom !== undefined) {
        dateFilter.gte = new Date(filter.dateFrom);
      }
      if (filter.dateTo !== undefined) {
        dateFilter.lte = new Date(filter.dateTo);
      }
      where.due_date = dateFilter;
    }

    return where;
  }

  private mapToEntity(raw: FeeCollectionWithHistories | FeeCollectionRow): FeeCollection {
    const histories =
      'histories' in raw && Array.isArray(raw.histories)
        ? raw.histories.map((h) => this.mapHistoryToEntity(h))
        : undefined;

    return new FeeCollection(
      raw.id.toString(),
      raw.student_id.toString(),
      raw.student_section_id?.toString() ?? null,
      raw.installment_no,
      Number(raw.fee_amount),
      Number(raw.paid_amount),
      Number(raw.balance_amount),
      raw.due_date,
      raw.fee_status as FeeStatus,
      raw.approval_status as ApprovalStatus,
      raw.created_by?.toString() ?? null,
      raw.updated_by?.toString() ?? null,
      raw.collected_by?.toString() ?? null,
      raw.collected_at,
      raw.auth_by?.toString() ?? null,
      raw.auth_at,
      raw.auth_remark,
      raw.created_at,
      raw.updated_at,
      histories,
    );
  }

  private mapHistoryToEntity(
    raw: Prisma.fee_collection_historiesGetPayload<Record<string, never>>,
  ): FeeCollectionHistory {
    return new FeeCollectionHistory(
      raw.id.toString(),
      raw.fee_collection_id.toString(),
      Number(raw.paid_amount),
      raw.collected_by?.toString() ?? null,
      raw.collected_at,
      raw.record_status,
      raw.created_at,
      raw.updated_at,
    );
  }
}
