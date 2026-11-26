import { requireRole } from '../../../../shared/middleware/requireRole';
import { Router } from 'express';
import { prisma } from '../../../../config/database';
import { PrismaStudentRepository } from '../../infrastructure/persistence/PrismaStudentRepository';
import { ListStudentsUseCase } from '../../application/use-cases/ListStudentsUseCase';
import { CreateStudentUseCase } from '../../application/use-cases/CreateStudentUseCase';
import { ResetStudentPasswordUseCase } from '../../application/use-cases/ResetStudentPasswordUseCase';
import { UpdateStudentUseCase, UpdateStudentProfileUseCase, UpdateStudentProfileImageUseCase } from '../../application/use-cases/UpdateStudentUseCases';
import {
  BlockStudentUseCase,
  UnblockStudentUseCase,
  DropStudentUseCase,
  UndropStudentUseCase,
  DeleteStudentUseCase,
  GetStudentBlockReasonsUseCase,
  UnblockStudentModulesUseCase,
  UpdateLoginStatusUseCase,
} from '../../application/use-cases/StudentManagementUseCases';
import { StudentController, handleProfilePicUpload } from '../controllers/StudentController';
import { validateRequest } from '../../../../shared/middleware/validateRequest';
import { authenticate } from '../../../../shared/middleware/authenticate';
import {
  CreateStudentSchema,
  AdminResetStudentPasswordSchema,
  UpdateStudentSchema,
  UpdateStudentProfileSchema,
  BlockStudentSchema,
  UnblockStudentSchema,
  DropStudentSchema,
  UndropStudentSchema,
  UnblockStudentModulesSchema,
  UpdateLoginStatusSchema,
} from '../../application/dto/StudentDTO';

export function createStudentRouter(): Router {
  const router = Router();

  const studentRepo = new PrismaStudentRepository(prisma);

  const listStudentsUseCase = new ListStudentsUseCase(studentRepo);
  const createStudentUseCase = new CreateStudentUseCase(studentRepo);
  const resetStudentPasswordUseCase = new ResetStudentPasswordUseCase(studentRepo);
  const updateStudentUseCase = new UpdateStudentUseCase(studentRepo);
  const updateStudentProfileUseCase = new UpdateStudentProfileUseCase(studentRepo);
  const updateStudentProfileImageUseCase = new UpdateStudentProfileImageUseCase(studentRepo);
  const blockStudentUseCase = new BlockStudentUseCase(studentRepo);
  const unblockStudentUseCase = new UnblockStudentUseCase(studentRepo);
  const dropStudentUseCase = new DropStudentUseCase(studentRepo);
  const undropStudentUseCase = new UndropStudentUseCase(studentRepo);
  const deleteStudentUseCase = new DeleteStudentUseCase(studentRepo);
  const getBlockReasonsUseCase = new GetStudentBlockReasonsUseCase(studentRepo);
  const unblockModulesUseCase = new UnblockStudentModulesUseCase(studentRepo);
  const updateLoginStatusUseCase = new UpdateLoginStatusUseCase(studentRepo);

  const studentController = new StudentController(
    listStudentsUseCase,
    createStudentUseCase,
    resetStudentPasswordUseCase,
    updateStudentUseCase,
    updateStudentProfileUseCase,
    updateStudentProfileImageUseCase,
    blockStudentUseCase,
    unblockStudentUseCase,
    dropStudentUseCase,
    undropStudentUseCase,
    deleteStudentUseCase,
    getBlockReasonsUseCase,
    unblockModulesUseCase,
    updateLoginStatusUseCase,
  );

  router.get('/', authenticate('institution_user'), studentController.list);
  router.get('/block-reasons', authenticate('institution_user'), studentController.getBlockReasons);

  router.post('/register', validateRequest(CreateStudentSchema), studentController.create);
  router.post('/reset-password', authenticate('institution_user'), requireRole(['Admin', 'Team Lead']), validateRequest(AdminResetStudentPasswordSchema), studentController.resetPassword);
  router.post('/block', authenticate('institution_user'), validateRequest(BlockStudentSchema), studentController.blockStudent);
  router.post('/unblock', authenticate('institution_user'), validateRequest(UnblockStudentSchema), studentController.unblockStudent);
  router.post('/drop', authenticate('institution_user'), validateRequest(DropStudentSchema), studentController.dropStudent);
  router.post('/undrop', authenticate('institution_user'), validateRequest(UndropStudentSchema), studentController.undropStudent);
  router.post('/unblock-modules', authenticate('institution_user'), validateRequest(UnblockStudentModulesSchema), studentController.unblockModules);
  router.post('/login-status', authenticate('any'), validateRequest(UpdateLoginStatusSchema), studentController.updateLoginStatus);
  router.post('/update-profile', authenticate('student'), validateRequest(UpdateStudentProfileSchema), studentController.updateProfile);
  router.post('/update-profile-image', authenticate('student'), handleProfilePicUpload, studentController.updateProfileImage);
  router.post('/', validateRequest(CreateStudentSchema), studentController.create);

  router.put('/:id', authenticate('institution_user'), validateRequest(UpdateStudentSchema), studentController.update);
  router.delete('/:id', authenticate('institution_user'), studentController.deleteStudent);

  return router;
}
