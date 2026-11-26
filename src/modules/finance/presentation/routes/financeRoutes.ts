import { Router } from 'express';
import { prisma } from '../../../../config/database';
import { PrismaFeeCollectionRepository } from '../../infrastructure/persistence/PrismaFeeCollectionRepository';
import { ListFeeCollectionsUseCase } from '../../application/use-cases/ListFeeCollectionsUseCase';
import { CreateFeeScheduleUseCase } from '../../application/use-cases/CreateFeeScheduleUseCase';
import { GetFeeCollectionUseCase } from '../../application/use-cases/GetFeeCollectionUseCase';
import { CollectFeeUseCase } from '../../application/use-cases/CollectFeeUseCase';
import { ApproveFeeCollectionUseCase } from '../../application/use-cases/ApproveFeeCollectionUseCase';
import { UpdateFeeInstallmentUseCase } from '../../application/use-cases/UpdateFeeInstallmentUseCase';
import { DeleteFeeInstallmentUseCase } from '../../application/use-cases/DeleteFeeInstallmentUseCase';
import { CancelFeeUseCase } from '../../application/use-cases/CancelFeeUseCase';
import { FeeCollectionController } from '../controllers/FeeCollectionController';
import { authenticate } from '../../../../shared/middleware/authenticate';
import { requireRole } from '../../../../shared/middleware/requireRole';
import { validateRequest } from '../../../../shared/middleware/validateRequest';
import {
  CreateFeeScheduleSchema,
  CollectFeeSchema,
  ApproveFeeSchema,
  UpdateInstallmentSchema,
  DeleteInstallmentSchema,
  CancelFeeSchema,
} from '../../application/dto/FeeCollectionDTO';

export function createFinanceRouter(): Router {
  const router = Router();

  const feeCollectionRepository = new PrismaFeeCollectionRepository(prisma);

  const listFeeCollectionsUseCase = new ListFeeCollectionsUseCase(feeCollectionRepository);
  const createFeeScheduleUseCase = new CreateFeeScheduleUseCase(feeCollectionRepository);
  const getFeeCollectionUseCase = new GetFeeCollectionUseCase(feeCollectionRepository);
  const collectFeeUseCase = new CollectFeeUseCase(feeCollectionRepository);
  const approveFeeCollectionUseCase = new ApproveFeeCollectionUseCase(feeCollectionRepository);
  const updateFeeInstallmentUseCase = new UpdateFeeInstallmentUseCase(feeCollectionRepository);
  const deleteFeeInstallmentUseCase = new DeleteFeeInstallmentUseCase(feeCollectionRepository);
  const cancelFeeUseCase = new CancelFeeUseCase(feeCollectionRepository);

  const controller = new FeeCollectionController(
    listFeeCollectionsUseCase,
    createFeeScheduleUseCase,
    getFeeCollectionUseCase,
    collectFeeUseCase,
    approveFeeCollectionUseCase,
    updateFeeInstallmentUseCase,
    deleteFeeInstallmentUseCase,
    cancelFeeUseCase,
  );

  const manageFees = requireRole(['Admin', 'Team Lead']);

  router.get(
    '/fee-collections',
    authenticate('institution_user'),
    manageFees,
    controller.index,
  );

  router.post(
    '/fee-collections',
    authenticate('institution_user'),
    manageFees,
    validateRequest(CreateFeeScheduleSchema),
    controller.store,
  );

  router.get(
    '/fee-collections/:id',
    authenticate('institution_user'),
    manageFees,
    controller.show,
  );

  router.post(
    '/fee-collections/collect',
    authenticate('institution_user'),
    manageFees,
    validateRequest(CollectFeeSchema),
    controller.collectFee,
  );

  router.post(
    '/fee-collections/approve',
    authenticate('institution_user'),
    manageFees,
    validateRequest(ApproveFeeSchema),
    controller.approveFee,
  );

  router.post(
    '/fee-collections/update-installment',
    authenticate('institution_user'),
    manageFees,
    validateRequest(UpdateInstallmentSchema),
    controller.updateInstallment,
  );

  router.post(
    '/fee-collections/delete-installment',
    authenticate('institution_user'),
    manageFees,
    validateRequest(DeleteInstallmentSchema),
    controller.deleteInstallment,
  );

  router.post(
    '/fee-collections/cancel',
    authenticate('institution_user'),
    manageFees,
    validateRequest(CancelFeeSchema),
    controller.cancelFee,
  );

  return router;
}

