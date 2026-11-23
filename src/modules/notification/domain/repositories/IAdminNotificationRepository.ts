import { AdminNotification } from '../entities/AdminNotification';

export interface IAdminNotificationRepository {
  create(data: { userId: number; message: string }): Promise<AdminNotification>;
  findByUserId(userId: number): Promise<AdminNotification[]>;
  markAsRead(userId: number, notificationId?: number | undefined): Promise<number>;
}

