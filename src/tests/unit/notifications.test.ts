import { describe, it, expect, vi } from 'vitest';
import { AdminNotification } from '../../modules/notification/domain/entities/AdminNotification';
import { StudentNotification } from '../../modules/notification/domain/entities/StudentNotification';
import { IAdminNotificationRepository } from '../../modules/notification/domain/repositories/IAdminNotificationRepository';
import { IStudentNotificationRepository } from '../../modules/notification/infrastructure/persistence/PrismaStudentNotificationRepository';
import { GetAdminNotificationsUseCase } from '../../modules/notification/application/use-cases/GetAdminNotificationsUseCase';
import { MarkAdminNotificationsReadUseCase } from '../../modules/notification/application/use-cases/MarkAdminNotificationsReadUseCase';
import {
  GetStudentNotificationsUseCase,
  MarkStudentNotificationsViewedUseCase,
} from '../../modules/notification/application/use-cases/StudentNotificationUseCases';

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

describe('Student Notifications Unit Tests', () => {
  const dummyStudentNotification = new StudentNotification({
    id: 10,
    studentId: 4,
    title: 'Module Unlocked',
    message: 'Module 2 is now unlocked',
    status: 'new',
    type: 'unlock',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockStudentRepo: IStudentNotificationRepository = {
    findLatestByStudentId: vi.fn().mockResolvedValue([dummyStudentNotification]),
    countUnreadByStudentId: vi.fn().mockResolvedValue(1),
    markStudentLoginActive: vi.fn().mockResolvedValue(undefined),
    markAllAsViewed: vi.fn().mockResolvedValue(2),
  };

  it('GetStudentNotificationsUseCase should mark login active and return notifications with unread count', async () => {
    const useCase = new GetStudentNotificationsUseCase(mockStudentRepo);
    const result = await useCase.execute(4);

    expect(mockStudentRepo.markStudentLoginActive).toHaveBeenCalledWith(4);
    expect(mockStudentRepo.findLatestByStudentId).toHaveBeenCalledWith(4, 6);
    expect(mockStudentRepo.countUnreadByStudentId).toHaveBeenCalledWith(4);
    expect(result.notifications).toHaveLength(1);
    expect(result.newCount).toBe(1);
  });

  it('MarkStudentNotificationsViewedUseCase should return updatedCount', async () => {
    const useCase = new MarkStudentNotificationsViewedUseCase(mockStudentRepo);
    const result = await useCase.execute(4);

    expect(mockStudentRepo.markAllAsViewed).toHaveBeenCalledWith(4);
    expect(result.updatedCount).toBe(2);
  });
});
