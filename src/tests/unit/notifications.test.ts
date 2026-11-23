import { describe, it, expect, vi } from 'vitest';
import { AdminNotification } from '../../modules/notification/domain/entities/AdminNotification';
import { IAdminNotificationRepository } from '../../modules/notification/domain/repositories/IAdminNotificationRepository';
import { GetAdminNotificationsUseCase } from '../../modules/notification/application/use-cases/GetAdminNotificationsUseCase';
import { MarkAdminNotificationsReadUseCase } from '../../modules/notification/application/use-cases/MarkAdminNotificationsReadUseCase';

describe('Admin Notifications Unit Tests', () => {
  const dummyNotification = new AdminNotification({
    id: 1,
    userId: 1,
    message: 'Welcome to Knovista Admin',
    status: 'new',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockRepo: IAdminNotificationRepository = {
    create: vi.fn().mockResolvedValue(dummyNotification),
    findByUserId: vi.fn().mockResolvedValue([dummyNotification]),
    markAsRead: vi.fn().mockResolvedValue(1),
  };

  it('GetAdminNotificationsUseCase should return notification list', async () => {
    const useCase = new GetAdminNotificationsUseCase(mockRepo);
    const notifications = await useCase.execute(1);

    expect(notifications).toHaveLength(1);
    expect(notifications[0]?.message).toBe('Welcome to Knovista Admin');
    expect(notifications[0]?.status).toBe('new');
  });

  it('MarkAdminNotificationsReadUseCase should mark notifications as read', async () => {
    const useCase = new MarkAdminNotificationsReadUseCase(mockRepo);
    const result = await useCase.execute(1, 1);

    expect(result.updated_count).toBe(1);
    expect(result.message).toBe('Notifications marked as read');
  });
});

