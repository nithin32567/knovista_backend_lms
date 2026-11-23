import { IAdminNotificationRepository } from '../../domain/repositories/IAdminNotificationRepository';

export class MarkAdminNotificationsReadUseCase {
  constructor(private readonly notificationRepository: IAdminNotificationRepository) {}

  async execute(userId: number, notificationId?: number | undefined) {
    const updatedCount = await this.notificationRepository.markAsRead(userId, notificationId);
    return {
      message: 'Notifications marked as read',
      updated_count: updatedCount,
    };
  }
}

