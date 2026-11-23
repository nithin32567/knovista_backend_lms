import { Router } from 'express';
import { prisma } from '../../../../config/database';
import { PrismaAdminNotificationRepository } from '../../infrastructure/persistence/PrismaAdminNotificationRepository';
import { GetAdminNotificationsUseCase } from '../../application/use-cases/GetAdminNotificationsUseCase';
import { MarkAdminNotificationsReadUseCase } from '../../application/use-cases/MarkAdminNotificationsReadUseCase';
import { AdminNotificationController } from '../controllers/AdminNotificationController';
import { authenticate } from '../../../../shared/middleware/authenticate';

export function createNotificationRouter(): Router {
  const router = Router();

  const repo = new PrismaAdminNotificationRepository(prisma);
  const getNotificationsUseCase = new GetAdminNotificationsUseCase(repo);
  const markReadUseCase = new MarkAdminNotificationsReadUseCase(repo);

  const controller = new AdminNotificationController(getNotificationsUseCase, markReadUseCase);

  router.use('/admin-notifications', authenticate('institution_user'));

  router.get('/admin-notifications', controller.index);
  router.post('/admin-notifications/mark-read', controller.markRead);

  return router;
}

