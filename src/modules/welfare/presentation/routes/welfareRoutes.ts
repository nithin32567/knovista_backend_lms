import { requireRole } from '../../../../shared/middleware/requireRole';
import { Router } from 'express';
import { prisma } from '../../../../config/database';
import { authenticate } from '../../../../shared/middleware/authenticate';
import { handleLeaveProofUpload } from '../../infrastructure/upload/leaveUploadMiddleware';

import { PrismaLeaveReasonRepository } from '../../infrastructure/persistence/PrismaLeaveReasonRepository';
import { PrismaStudentLeaveRepository } from '../../infrastructure/persistence/PrismaStudentLeaveRepository';
import { PrismaStudentReportRepository } from '../../infrastructure/persistence/PrismaStudentReportRepository';
import { PrismaAdminNotificationRepository } from '../../../notification/infrastructure/persistence/PrismaAdminNotificationRepository';
import { PrismaStudentNotificationRepository } from '../../../notification/infrastructure/persistence/PrismaStudentNotificationRepository';

import { GetLeaveReasonsUseCase } from '../../application/use-cases/GetLeaveReasonsUseCase';
import { CreateLeaveUseCase } from '../../application/use-cases/leaves/CreateLeaveUseCase';
import { ListLeavesUseCase } from '../../application/use-cases/leaves/ListLeavesUseCase';
import { AuthorizeLeaveUseCase } from '../../application/use-cases/leaves/AuthorizeLeaveUseCase';
import { GetLeaveProofUseCase } from '../../application/use-cases/leaves/GetLeaveProofUseCase';

import { CreateStudentReportUseCase } from '../../application/use-cases/reports/CreateStudentReportUseCase';
import { ListStudentReportsUseCase } from '../../application/use-cases/reports/ListStudentReportsUseCase';
import { GetReportHeadsUseCase } from '../../application/use-cases/reports/GetReportHeadsUseCase';
import { DeleteStudentReportUseCase } from '../../application/use-cases/reports/DeleteStudentReportUseCase';

import { StudentLeaveController } from '../controllers/StudentLeaveController';
import { StudentReportController } from '../controllers/StudentReportController';

export function createWelfareRouter(): Router {
  const router = Router();

  const leaveReasonRepo = new PrismaLeaveReasonRepository(prisma);
  const studentLeaveRepo = new PrismaStudentLeaveRepository(prisma);
  const studentReportRepo = new PrismaStudentReportRepository(prisma);
  const adminNotificationRepo = new PrismaAdminNotificationRepository(prisma);
  const studentNotificationRepo = new PrismaStudentNotificationRepository(prisma);

  const getLeaveReasonsUseCase = new GetLeaveReasonsUseCase(leaveReasonRepo);
  const createLeaveUseCase = new CreateLeaveUseCase(studentLeaveRepo, adminNotificationRepo, prisma);
  const listLeavesUseCase = new ListLeavesUseCase(studentLeaveRepo, prisma);
  const authorizeLeaveUseCase = new AuthorizeLeaveUseCase(studentLeaveRepo, studentNotificationRepo);
  const getLeaveProofUseCase = new GetLeaveProofUseCase(studentLeaveRepo, prisma);

  const createStudentReportUseCase = new CreateStudentReportUseCase(studentReportRepo, prisma);
  const listStudentReportsUseCase = new ListStudentReportsUseCase(studentReportRepo, prisma);
  const getReportHeadsUseCase = new GetReportHeadsUseCase(studentReportRepo);
  const deleteStudentReportUseCase = new DeleteStudentReportUseCase(studentReportRepo);

  const leaveController = new StudentLeaveController(
    createLeaveUseCase,
    listLeavesUseCase,
    authorizeLeaveUseCase,
    getLeaveProofUseCase,
    getLeaveReasonsUseCase,
  );

  const reportController = new StudentReportController(
    createStudentReportUseCase,
    listStudentReportsUseCase,
    getReportHeadsUseCase,
    deleteStudentReportUseCase,
  );

  router.get('/leave-reasons', authenticate('any'), leaveController.getLeaveReasons);

  router.get('/student-leaves', authenticate('any'), leaveController.listLeaves);
  router.post(
    '/student-leaves',
    authenticate('student'),
    handleLeaveProofUpload,
    leaveController.createLeave,
  );
  router.post(
    '/student-leaves/:id/authorize',
    authenticate('institution_user'),
    requireRole(['Admin', 'Team Lead']),
    leaveController.authorizeLeave,
  );
  router.get(
    '/student-leaves/:id/proof',
    authenticate('any'),
    leaveController.getLeaveProof,
  );

  router.get(
    '/student-report-heads',
    authenticate('institution_user'),
    reportController.getReportHeads,
  );
  router.post(
    '/student-reports',
    authenticate('institution_user'),
    reportController.createReport,
  );
  router.get(
    '/student-reports/list',
    authenticate('institution_user'),
    reportController.listReports,
  );
  router.delete(
    '/student-reports/:id',
    authenticate('institution_user'),
    reportController.deleteReport,
  );

  return router;
}
