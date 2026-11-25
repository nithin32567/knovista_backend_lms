import { PrismaClient } from '@prisma/client';
import { ILeaveReasonRepository } from '../../domain/repositories/ILeaveReasonRepository';
import { LeaveReason } from '../../domain/entities/LeaveReason';

export class PrismaLeaveReasonRepository implements ILeaveReasonRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findActiveReasons(): Promise<LeaveReason[]> {
    const records = await this.prisma.leave_reasons.findMany({
      where: { status: { not: 'deleted' } },
      orderBy: { name: 'asc' },
    });

    return records.map(
      (r) =>
        new LeaveReason({
          id: Number(r.id),
          name: r.name,
          status: r.status,
          createdBy: r.created_by ? Number(r.created_by) : null,
          updatedBy: r.updated_by ? Number(r.updated_by) : null,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        })
    );
  }
}

