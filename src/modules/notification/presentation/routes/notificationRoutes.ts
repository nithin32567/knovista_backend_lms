import { Router } from 'express';
import { prisma } from '../../../../config/database';
import { PrismaAdminNotificationRepository } from '../../infrastructure/persistence/PrismaAdminNotificationRepository';
import { PrismaStudentNotificationRepository } from '../../infrastructure/persistence/PrismaStudentNotificationRepository';
import { GetAdminNotificationsUseCase } from '../../application/use-cases/GetAdminNotificationsUseCase';
import { MarkAdminNotificationsReadUseCase } from '../../application/use-cases/MarkAdminNotificationsReadUseCase';
import { GetStudentNotificationsUseCase, MarkStudentNotificationsViewedUseCase } from '../../application/use-cases/StudentNotificationUseCases';
import { AdminNotificationController } from '../controllers/AdminNotificationController';
import { StudentNotificationController } from '../controllers/StudentNotificationController';
import { authenticate } from '../../../../shared/middleware/authenticate';
import { validateQuery, validateRequest } from '../../../../shared/middleware/validateRequest';
import { StudentNotificationsQuerySchema, MarkStudentNotificationsViewedSchema } from '../../application/dto/NotificationDTO';

export function createNotificationRouter(): Router {
  const router = Router();

  const adminRepo = new PrismaAdminNotificationRepository(prisma);
  const getAdminNotificationsUseCase = new GetAdminNotificationsUseCase(adminRepo);
  const markAdminReadUseCase = new MarkAdminNotificationsReadUseCase(adminRepo);
  const adminController = new AdminNotificationController(getAdminNotificationsUseCase, markAdminReadUseCase);

  const studentNotifRepo = new PrismaStudentNotificationRepository(prisma);
  const getStudentNotificationsUseCase = new GetStudentNotificationsUseCase(studentNotifRepo);
  const markStudentViewedUseCase = new MarkStudentNotificationsViewedUseCase(studentNotifRepo);
  const studentNotifController = new StudentNotificationController(getStudentNotificationsUseCase, markStudentViewedUseCase);

  router.use('/admin-notifications', authenticate('institution_user'));
  router.get('/admin-notifications', adminController.index);
  router.post('/admin-notifications/mark-read', adminController.markRead);

  router.get(
    '/student/notifications',
    authenticate('any'),
    validateQuery(StudentNotificationsQuerySchema),
    studentNotifController.getNotifications
  );
  router.post(
    '/student/notifications/mark-viewed',
    authenticate('any'),
    validateRequest(MarkStudentNotificationsViewedSchema),
    studentNotifController.markViewed
  );

  return router;
}
