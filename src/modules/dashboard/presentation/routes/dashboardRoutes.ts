import { Router } from 'express';
import { prisma } from '../../../../config/database';
import { PrismaDashboardRepository } from '../../infrastructure/persistence/PrismaDashboardRepository';
import { GetAdminDashboardStatsUseCase } from '../../application/use-cases/GetAdminDashboardStatsUseCase';
import { GetStudentDashboardUseCase } from '../../application/use-cases/GetStudentDashboardUseCase';
import { GetDailyQuotesUseCase } from '../../application/use-cases/GetDailyQuotesUseCase';
import { DashboardController } from '../controllers/DashboardController';
import { authenticate } from '../../../../shared/middleware/authenticate';
import { validateQuery } from '../../../../shared/middleware/validateRequest';
import { StudentDashboardQuerySchema } from '../../application/dto/DashboardDTO';

function createDashboardController(): DashboardController {
  const dashboardRepo = new PrismaDashboardRepository(prisma);
  const getAdminDashboardStatsUseCase = new GetAdminDashboardStatsUseCase(dashboardRepo);
  const getStudentDashboardUseCase = new GetStudentDashboardUseCase(prisma);
  const getDailyQuotesUseCase = new GetDailyQuotesUseCase(prisma);

  return new DashboardController(
    getAdminDashboardStatsUseCase,
    getStudentDashboardUseCase,
    getDailyQuotesUseCase,
  );
}

export function createDashboardRouter(): Router {
  const router = Router();
  const dashboardController = createDashboardController();

  router.get('/admin', authenticate('institution_user'), dashboardController.getAdminStats);
  router.get('/student', authenticate('any'), validateQuery(StudentDashboardQuerySchema), dashboardController.getStudentDashboard);
  router.get('/daily-quotes', authenticate('any'), dashboardController.getDailyQuotes);

  return router;
}

export function createRootDashboardRouter(): Router {
  const router = Router();
  const dashboardController = createDashboardController();

  router.get('/student/dashboard', authenticate('any'), validateQuery(StudentDashboardQuerySchema), dashboardController.getStudentDashboard);
  router.get('/daily-quotes', authenticate('any'), dashboardController.getDailyQuotes);

  return router;
}
