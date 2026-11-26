import { z } from 'zod';
import { requireRole } from '../../../../shared/middleware/requireRole';
import { Router } from 'express';
import { prisma } from '../../../../config/database';
import { PrismaProgressRepository } from '../../infrastructure/persistence/PrismaProgressRepository';
import { PrismaPerformanceRepository } from '../../infrastructure/persistence/PrismaPerformanceRepository';
import { PrismaAdminNotificationRepository } from '../../../notification/infrastructure/persistence/PrismaAdminNotificationRepository';

import { CompleteStudentTopicUseCase } from '../../application/use-cases/CompleteStudentTopicUseCase';
import { RequestModuleUnlockUseCase } from '../../application/use-cases/RequestModuleUnlockUseCase';
import { ListModuleUnlockRequestsUseCase } from '../../application/use-cases/ListModuleUnlockRequestsUseCase';
import { ApproveModuleUnlockUseCase } from '../../application/use-cases/ApproveModuleUnlockUseCase';
import { CompleteCourseUseCase } from '../../application/use-cases/CompleteCourseUseCase';
import { ProgressController } from '../controllers/ProgressController';

import { RecordPerformanceUseCase } from '../../application/use-cases/RecordPerformanceUseCase';
import { ListPerformanceUseCase } from '../../application/use-cases/ListPerformanceUseCase';
import { GetStudentModulePerformanceUseCase } from '../../application/use-cases/GetStudentModulePerformanceUseCase';
import { PerformanceController } from '../controllers/PerformanceController';

import { authenticate } from '../../../../shared/middleware/authenticate';
import { validateRequest, validateParams, validateQuery } from '../../../../shared/middleware/validateRequest';
import {
  ListUnlockRequestsQuerySchema,
  CompleteStudentTopicSchema,
  RequestUnlockNextModuleSchema,
  ApproveModuleUnlockSchema,
  SavePerformanceSchema,
  CompleteCourseSchema,
} from '../../application/dto/ProgressDTO';

export function createProgressRouter(): Router {
  const router = Router();

  const progressRepo = new PrismaProgressRepository(prisma);
  const performanceRepo = new PrismaPerformanceRepository(prisma);
  const notificationRepo = new PrismaAdminNotificationRepository(prisma);

  const completeStudentTopicUseCase = new CompleteStudentTopicUseCase(progressRepo);
  const requestModuleUnlockUseCase = new RequestModuleUnlockUseCase(progressRepo, notificationRepo);
  const listModuleUnlockRequestsUseCase = new ListModuleUnlockRequestsUseCase(progressRepo);
  const approveModuleUnlockUseCase = new ApproveModuleUnlockUseCase(progressRepo);
  const completeCourseUseCase = new CompleteCourseUseCase(progressRepo);

  const progressController = new ProgressController(
    completeStudentTopicUseCase,
    requestModuleUnlockUseCase,
    listModuleUnlockRequestsUseCase,
    approveModuleUnlockUseCase,
    completeCourseUseCase
  );

  const recordPerformanceUseCase = new RecordPerformanceUseCase(performanceRepo);
  const listPerformanceUseCase = new ListPerformanceUseCase(performanceRepo);
  const getStudentModulePerformanceUseCase = new GetStudentModulePerformanceUseCase(performanceRepo);

  const performanceController = new PerformanceController(
    recordPerformanceUseCase,
    listPerformanceUseCase,
    getStudentModulePerformanceUseCase,
    performanceRepo
  );

  router.post(
    '/student-section-topics/complete',
    authenticate('student'),
    validateRequest(CompleteStudentTopicSchema),
    progressController.completeTopic
  );

  router.post(
    '/student-sections/request-unlock-next-module',
    authenticate('student'),
    validateRequest(RequestUnlockNextModuleSchema),
    progressController.requestUnlock
  );

  router.get(
    '/student-sections/module-unlock-requests',
    authenticate('institution_user'),
    requireRole(['Admin', 'Team Lead', 'Tutor', 'Quality Analyst']),
    validateQuery(ListUnlockRequestsQuerySchema),
    progressController.listUnlockRequests
  );

  router.post(
    '/student-sections/approve-module-unlock',
    authenticate('institution_user'),
    requireRole(['Admin', 'Team Lead', 'Tutor', 'Quality Analyst']),
    validateRequest(ApproveModuleUnlockSchema),
    progressController.approveUnlock
  );

  router.post(
    '/student-sections/complete-course',
    authenticate('institution_user'),
    requireRole(['Admin', 'Team Lead']),
    validateRequest(CompleteCourseSchema),
    progressController.completeCourse
  );

  router.get('/performances', authenticate('institution_user'), requireRole(['Admin', 'Team Lead']), performanceController.index);
  router.post(
    '/performances',
    authenticate('institution_user'),
    requireRole(['Admin', 'Team Lead']),
    validateRequest(SavePerformanceSchema),
    performanceController.store
  );
  router.get('/performances/:id', authenticate('institution_user'), requireRole(['Admin', 'Team Lead']), performanceController.show);
  router.delete('/performances/:id', authenticate('institution_user'), requireRole(['Admin', 'Team Lead']), performanceController.destroy);

  router.get('/students/:student_id/module-performance', authenticate('any'), validateParams(z.object({ student_id: z.coerce.number().int().positive().safe() })), performanceController.modulePerformance);
  router.get('/students/completed-modules', authenticate('institution_user'), requireRole(['Admin', 'Team Lead']), performanceController.completedModules);

  return router;
}
