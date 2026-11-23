import { IAdminNotificationRepository } from '../../domain/repositories/IAdminNotificationRepository';

export class GetAdminNotificationsUseCase {
  constructor(private readonly notificationRepository: IAdminNotificationRepository) {}

  async execute(userId: number) {
    const notifications = await this.notificationRepository.findByUserId(userId);
    return notifications.map((n) => n.toResponseObject());
  }
}

