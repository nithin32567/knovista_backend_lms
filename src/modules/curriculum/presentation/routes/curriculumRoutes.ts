import { Router } from 'express';
import { prisma } from '../../../../config/database';
import { PrismaProgramRepository } from '../../infrastructure/persistence/PrismaProgramRepository';
import { PrismaSectionRepository } from '../../infrastructure/persistence/PrismaSectionRepository';
import { PrismaModuleRepository } from '../../infrastructure/persistence/PrismaModuleRepository';
import { PrismaTopicRepository } from '../../infrastructure/persistence/PrismaTopicRepository';
import { PrismaSpecialCategoryRepository } from '../../infrastructure/persistence/PrismaSpecialCategoryRepository';

import { ListProgramsUseCase } from '../../application/use-cases/programs/ListProgramsUseCase';
import { CreateProgramUseCase } from '../../application/use-cases/programs/CreateProgramUseCase';
import { GetProgramUseCase } from '../../application/use-cases/programs/GetProgramUseCase';
import { UpdateProgramUseCase } from '../../application/use-cases/programs/UpdateProgramUseCase';
import { ProgramController } from '../controllers/ProgramController';

import { ListSectionsUseCase } from '../../application/use-cases/sections/ListSectionsUseCase';
import { CreateSectionUseCase } from '../../application/use-cases/sections/CreateSectionUseCase';
import { GetSectionUseCase } from '../../application/use-cases/sections/GetSectionUseCase';
import { UpdateSectionUseCase } from '../../application/use-cases/sections/UpdateSectionUseCase';
import { SectionController } from '../controllers/SectionController';

import { ListModulesUseCase } from '../../application/use-cases/modules/ListModulesUseCase';
import { CreateModuleUseCase } from '../../application/use-cases/modules/CreateModuleUseCase';
import { GetModuleUseCase } from '../../application/use-cases/modules/GetModuleUseCase';
import { UpdateModuleUseCase } from '../../application/use-cases/modules/UpdateModuleUseCase';
import { ModuleController } from '../controllers/ModuleController';

import { ListTopicsUseCase } from '../../application/use-cases/topics/ListTopicsUseCase';
import { CreateTopicUseCase } from '../../application/use-cases/topics/CreateTopicUseCase';
import { GetTopicUseCase } from '../../application/use-cases/topics/GetTopicUseCase';
import { UpdateTopicUseCase } from '../../application/use-cases/topics/UpdateTopicUseCase';
import { TopicController } from '../controllers/TopicController';

import { ListSpecialCategoriesUseCase } from '../../application/use-cases/special-categories/ListSpecialCategoriesUseCase';
import { CreateSpecialCategoryUseCase } from '../../application/use-cases/special-categories/CreateSpecialCategoryUseCase';
import { GetSpecialCategoryUseCase } from '../../application/use-cases/special-categories/GetSpecialCategoryUseCase';
import { UpdateSpecialCategoryUseCase } from '../../application/use-cases/special-categories/UpdateSpecialCategoryUseCase';
import { SpecialCategoryController } from '../controllers/SpecialCategoryController';

import { authenticate } from '../../../../shared/middleware/authenticate';
import { validateRequest } from '../../../../shared/middleware/validateRequest';
import { handleProgramUpload, handleSectionUpload } from '../../../../shared/middleware/uploadMiddleware';
import { CreateProgramSchema, UpdateProgramSchema } from '../../application/dto/ProgramDTO';
import { CreateSectionSchema, UpdateSectionSchema } from '../../application/dto/SectionDTO';
import { CreateModuleSchema, UpdateModuleSchema } from '../../application/dto/ModuleDTO';
import { CreateTopicSchema, UpdateTopicSchema } from '../../application/dto/TopicDTO';
import { CreateSpecialCategorySchema, UpdateSpecialCategorySchema } from '../../application/dto/SpecialCategoryDTO';

export function createCurriculumRouter(): Router {
  const router = Router();

  const programRepo = new PrismaProgramRepository(prisma);
  const sectionRepo = new PrismaSectionRepository(prisma);
  const moduleRepo = new PrismaModuleRepository(prisma);
  const topicRepo = new PrismaTopicRepository(prisma);
  const specialCategoryRepo = new PrismaSpecialCategoryRepository(prisma);

  const programController = new ProgramController(
    new ListProgramsUseCase(programRepo),
    new CreateProgramUseCase(programRepo),
    new GetProgramUseCase(programRepo),
    new UpdateProgramUseCase(programRepo)
  );

  const sectionController = new SectionController(
    new ListSectionsUseCase(sectionRepo),
    new CreateSectionUseCase(sectionRepo, programRepo),
    new GetSectionUseCase(sectionRepo),
    new UpdateSectionUseCase(sectionRepo)
  );

  const moduleController = new ModuleController(
    new ListModulesUseCase(moduleRepo),
    new CreateModuleUseCase(moduleRepo, sectionRepo),
    new GetModuleUseCase(moduleRepo),
    new UpdateModuleUseCase(moduleRepo)
  );

  const topicController = new TopicController(
    new ListTopicsUseCase(topicRepo),
    new CreateTopicUseCase(topicRepo, moduleRepo),
    new GetTopicUseCase(topicRepo),
    new UpdateTopicUseCase(topicRepo)
  );

  const specialCategoryController = new SpecialCategoryController(
    new ListSpecialCategoriesUseCase(specialCategoryRepo),
    new CreateSpecialCategoryUseCase(specialCategoryRepo),
    new GetSpecialCategoryUseCase(specialCategoryRepo),
    new UpdateSpecialCategoryUseCase(specialCategoryRepo)
  );

  router.use(
    ['/programs', '/sections', '/modules', '/topics', '/special-categories'],
    authenticate('institution_user')
  );

  router.get('/programs', programController.index);
  router.post(
    '/programs',
    handleProgramUpload,
    validateRequest(CreateProgramSchema),
    programController.store
  );
  router.get('/programs/:id', programController.show);
  router.put(
    '/programs/:id',
    handleProgramUpload,
    validateRequest(UpdateProgramSchema),
    programController.update
  );
  router.post(
    '/programs/:id',
    handleProgramUpload,
    validateRequest(UpdateProgramSchema),
    programController.update
  );
  router.post(
    '/programs/:id/update',
    handleProgramUpload,
    validateRequest(UpdateProgramSchema),
    programController.update
  );

  router.get('/sections', sectionController.index);
  router.post(
    '/sections',
    handleSectionUpload,
    validateRequest(CreateSectionSchema),
    sectionController.store
  );
  router.get('/sections/:id', sectionController.show);
  router.put(
    '/sections/:id',
    handleSectionUpload,
    validateRequest(UpdateSectionSchema),
    sectionController.update
  );
  router.post(
    '/sections/:id',
    handleSectionUpload,
    validateRequest(UpdateSectionSchema),
    sectionController.update
  );
  router.post(
    '/sections/:id/update',
    handleSectionUpload,
    validateRequest(UpdateSectionSchema),
    sectionController.update
  );

  router.get('/modules', moduleController.index);
  router.post('/modules', validateRequest(CreateModuleSchema), moduleController.store);
  router.get('/modules/:id', moduleController.show);
  router.put('/modules/:id', validateRequest(UpdateModuleSchema), moduleController.update);
  router.post('/modules/:id/update', validateRequest(UpdateModuleSchema), moduleController.update);

  router.get('/topics', topicController.index);
  router.post('/topics', validateRequest(CreateTopicSchema), topicController.store);
  router.get('/topics/:id', topicController.show);
  router.put('/topics/:id', validateRequest(UpdateTopicSchema), topicController.update);
  router.post('/topics/:id/update', validateRequest(UpdateTopicSchema), topicController.update);

  router.get('/special-categories', specialCategoryController.index);
  router.post('/special-categories', validateRequest(CreateSpecialCategorySchema), specialCategoryController.store);
  router.get('/special-categories/:id', specialCategoryController.show);
  router.put('/special-categories/:id', validateRequest(UpdateSpecialCategorySchema), specialCategoryController.update);
  router.post('/special-categories/:id/update', validateRequest(UpdateSpecialCategorySchema), specialCategoryController.update);

  return router;
}

