import { Router } from 'express';
import { prisma } from '../../../../config/database';
import { PrismaBatchRepository } from '../../infrastructure/persistence/PrismaBatchRepository';
import { PrismaStudentSectionRepository } from '../../infrastructure/persistence/PrismaStudentSectionRepository';
import { PrismaProgramExtensionRepository } from '../../infrastructure/persistence/PrismaProgramExtensionRepository';

import { ListBatchesUseCase } from '../../application/use-cases/batches/ListBatchesUseCase';
import { CreateBatchUseCase } from '../../application/use-cases/batches/CreateBatchUseCase';
import { GetBatchUseCase } from '../../application/use-cases/batches/GetBatchUseCase';
import { BatchController } from '../controllers/BatchController';

import { ListStudentSectionsUseCase } from '../../application/use-cases/enrollments/ListStudentSectionsUseCase';
import { CreateStudentSectionUseCase } from '../../application/use-cases/enrollments/CreateStudentSectionUseCase';
import { GetStudentSectionUseCase } from '../../application/use-cases/enrollments/GetStudentSectionUseCase';
import { UpdateStudentSectionUseCase } from '../../application/use-cases/enrollments/UpdateStudentSectionUseCase';
import { DeleteStudentSectionUseCase } from '../../application/use-cases/enrollments/DeleteStudentSectionUseCase';
import { GetStudentMyBatchesUseCase } from '../../application/use-cases/enrollments/GetStudentMyBatchesUseCase';
import { GetStudentBatchModulesUseCase } from '../../application/use-cases/enrollments/GetStudentBatchModulesUseCase';
import { StudentSectionController } from '../controllers/StudentSectionController';

import { ListExtensionsUseCase } from '../../application/use-cases/extensions/ListExtensionsUseCase';
import { CreateExtensionUseCase } from '../../application/use-cases/extensions/CreateExtensionUseCase';
import { GetExtensionUseCase } from '../../application/use-cases/extensions/GetExtensionUseCase';
import { UpdateExtensionUseCase } from '../../application/use-cases/extensions/UpdateExtensionUseCase';
import { ProgramExtensionController } from '../controllers/ProgramExtensionController';

import { authenticate } from '../../../../shared/middleware/authenticate';
import { validateRequest } from '../../../../shared/middleware/validateRequest';
import { CreateBatchSchema } from '../../application/dto/BatchDTO';
import { CreateStudentSectionSchema, UpdateStudentSectionSchema } from '../../application/dto/StudentSectionDTO';
import { CreateExtensionSchema, UpdateExtensionSchema } from '../../application/dto/ProgramExtensionDTO';

export function createBatchRouter(): Router {
  const router = Router();

  const batchRepo = new PrismaBatchRepository(prisma);
  const studentSectionRepo = new PrismaStudentSectionRepository(prisma);
  const extensionRepo = new PrismaProgramExtensionRepository(prisma);

  const batchController = new BatchController(
    new ListBatchesUseCase(batchRepo),
    new CreateBatchUseCase(batchRepo),
    new GetBatchUseCase(batchRepo)
  );

  const studentSectionController = new StudentSectionController(
    new ListStudentSectionsUseCase(studentSectionRepo),
    new CreateStudentSectionUseCase(studentSectionRepo, batchRepo),
    new GetStudentSectionUseCase(studentSectionRepo),
    new UpdateStudentSectionUseCase(studentSectionRepo),
    new DeleteStudentSectionUseCase(studentSectionRepo),
    new GetStudentMyBatchesUseCase(studentSectionRepo),
    new GetStudentBatchModulesUseCase(studentSectionRepo)
  );

  const extensionController = new ProgramExtensionController(
    new ListExtensionsUseCase(extensionRepo),
    new CreateExtensionUseCase(extensionRepo, studentSectionRepo),
    new GetExtensionUseCase(extensionRepo),
    new UpdateExtensionUseCase(extensionRepo, studentSectionRepo)
  );

  router.get('/student/my-batches', authenticate('student'), studentSectionController.myBatches);
  router.get('/student/my-batch/:batchId/modules', authenticate('student'), studentSectionController.batchModules);

  router.get('/program-section-batches', authenticate('institution_user'), batchController.index);
  router.post('/program-section-batches', authenticate('institution_user'), validateRequest(CreateBatchSchema), batchController.store);
  router.get('/program-section-batches/:id', authenticate('institution_user'), batchController.show);

  router.get('/student-sections', authenticate('institution_user'), studentSectionController.index);
  router.post('/student-sections', authenticate('institution_user'), validateRequest(CreateStudentSectionSchema), studentSectionController.store);
  router.get('/student-sections/:id', authenticate('institution_user'), studentSectionController.show);
  router.put('/student-sections/:id', authenticate('institution_user'), validateRequest(UpdateStudentSectionSchema), studentSectionController.update);
  router.delete('/student-sections/:id', authenticate('institution_user'), studentSectionController.destroy);

  router.get('/program-extensions', authenticate('institution_user'), extensionController.index);
  router.post('/program-extensions', authenticate('institution_user'), validateRequest(CreateExtensionSchema), extensionController.store);
  router.get('/program-extensions/:id', authenticate('institution_user'), extensionController.show);
  router.put('/program-extensions/:id', authenticate('institution_user'), validateRequest(UpdateExtensionSchema), extensionController.update);

  return router;
}

