import { IStudentNotificationRepository } from '../../infrastructure/persistence/PrismaStudentNotificationRepository';
import { StudentNotification } from '../../domain/entities/StudentNotification';

export interface StudentNotificationsResult {
  notifications: StudentNotification[];
  newCount: number;
}

export class GetStudentNotificationsUseCase {
  constructor(private readonly repo: IStudentNotificationRepository) {}

  async execute(studentId: number): Promise<StudentNotificationsResult> {
    await this.repo.markStudentLoginActive(studentId);
    const [notifications, newCount] = await Promise.all([
      this.repo.findLatestByStudentId(studentId, 6),
      this.repo.countUnreadByStudentId(studentId),
    ]);
    return { notifications, newCount };
  }
}

export class MarkStudentNotificationsViewedUseCase {
  constructor(private readonly repo: IStudentNotificationRepository) {}

  async execute(studentId: number): Promise<{ updatedCount: number }> {
    const count = await this.repo.markAllAsViewed(studentId);
    return { updatedCount: count };
  }
}
