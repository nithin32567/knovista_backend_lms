import { PrismaClient } from '@prisma/client';
import { StudentNotification } from '../../domain/entities/StudentNotification';

export interface IStudentNotificationRepository {
  findLatestByStudentId(studentId: number, limit: number): Promise<StudentNotification[]>;
  countUnreadByStudentId(studentId: number): Promise<number>;
  markStudentLoginActive(studentId: number): Promise<void>;
  markAllAsViewed(studentId: number): Promise<number>;
}

export class PrismaStudentNotificationRepository implements IStudentNotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findLatestByStudentId(studentId: number, limit: number): Promise<StudentNotification[]> {
    const records = await this.prisma.student_notifications.findMany({
      where: { student_id: BigInt(studentId) },
      orderBy: { created_at: 'desc' },
      take: limit,
    });

    return records.map(
      (r) =>
        new StudentNotification({
          id: Number(r.id),
          studentId: Number(r.student_id),
          title: r.title,
          message: r.message,
          status: r.status,
          type: r.type,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        })
    );
  }

  async countUnreadByStudentId(studentId: number): Promise<number> {
    return this.prisma.student_notifications.count({
      where: { student_id: BigInt(studentId), status: 'new' },
    });
  }

  async markStudentLoginActive(studentId: number): Promise<void> {
    await this.prisma.students.updateMany({
      where: { id: BigInt(studentId) },
      data: {
        login_status: 'active',
        login_status_updated_at: new Date(),
      },
    });
  }

  async markAllAsViewed(studentId: number): Promise<number> {
    const result = await this.prisma.student_notifications.updateMany({
      where: { student_id: BigInt(studentId), status: 'new' },
      data: { status: 'viewed' },
    });
    return result.count;
  }
}
