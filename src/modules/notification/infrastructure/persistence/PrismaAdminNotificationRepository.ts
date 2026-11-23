import { PrismaClient, Prisma } from '@prisma/client';
import { IAdminNotificationRepository } from '../../domain/repositories/IAdminNotificationRepository';
import { AdminNotification, AdminNotificationProps } from '../../domain/entities/AdminNotification';

export class PrismaAdminNotificationRepository implements IAdminNotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: { userId: number; message: string }): Promise<AdminNotification> {
    const record = await this.prisma.admin_notifications.create({
      data: {
        user_id: BigInt(data.userId),
        message: data.message,
        status: 'new',
      },
    });

    return this.mapToDomain(record);
  }

  async findByUserId(userId: number): Promise<AdminNotification[]> {
    const where: Prisma.admin_notificationsWhereInput = {
      OR: [
        { user_id: BigInt(userId) },
        { user_id: null },
      ],
    };

    const records = await this.prisma.admin_notifications.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    return records.map((r) => this.mapToDomain(r));
  }

  async markAsRead(userId: number, notificationId?: number | undefined): Promise<number> {
    const where: Prisma.admin_notificationsWhereInput = {
      OR: [
        { user_id: BigInt(userId) },
        { user_id: null },
      ],
    };

    if (notificationId !== undefined) {
      where.id = BigInt(notificationId);
    } else {
      where.status = 'new';
    }

    const result = await this.prisma.admin_notifications.updateMany({
      where,
      data: {
        status: 'viewed',
      },
    });

    return result.count;
  }

  private mapToDomain(raw: {
    id: bigint;
    user_id: bigint | null;
    message: string;
    status: string;
    created_at: Date | null;
    updated_at: Date | null;
  }): AdminNotification {
    const props: AdminNotificationProps = {
      id: Number(raw.id),
      userId: raw.user_id ? Number(raw.user_id) : null,
      message: raw.message,
      status: raw.status,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
    return new AdminNotification(props);
  }
}

