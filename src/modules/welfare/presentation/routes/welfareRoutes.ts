import { Router } from 'express';
import { prisma } from '../../../../config/database';
import { PrismaLeaveReasonRepository } from '../../infrastructure/persistence/PrismaLeaveReasonRepository';
import { GetLeaveReasonsUseCase } from '../../application/use-cases/GetLeaveReasonsUseCase';
import { LeaveController } from '../controllers/LeaveController';
import { authenticate } from '../../../../shared/middleware/authenticate';

export function createWelfareRouter(): Router {
  const router = Router();

  const leaveReasonRepo = new PrismaLeaveReasonRepository(prisma);
  const getLeaveReasonsUseCase = new GetLeaveReasonsUseCase(leaveReasonRepo);
  const leaveController = new LeaveController(getLeaveReasonsUseCase);

  router.get('/leave-reasons', authenticate('any'), leaveController.getLeaveReasons);

  return router;
}

