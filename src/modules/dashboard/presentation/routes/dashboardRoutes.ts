import { Router } from 'express';
import { prisma } from '../../../../config/database';
import { PrismaDashboardRepository } from '../../infrastructure/persistence/PrismaDashboardRepository';
import { GetAdminDashboardStatsUseCase } from '../../application/use-cases/GetAdminDashboardStatsUseCase';
import { DashboardController } from '../controllers/DashboardController';
import { authenticate } from '../../../../shared/middleware/authenticate';

export function createDashboardRouter(): Router {
  const router = Router();
  const dashboardRepo = new PrismaDashboardRepository(prisma);
  const getAdminDashboardStatsUseCase = new GetAdminDashboardStatsUseCase(dashboardRepo);
  const dashboardController = new DashboardController(getAdminDashboardStatsUseCase);

  router.get('/admin', authenticate('institution_user'), dashboardController.getAdminStats);

  return router;
}

