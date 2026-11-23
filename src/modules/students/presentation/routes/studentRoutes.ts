import { Router } from 'express';
import { prisma } from '../../../../config/database';
import { PrismaStudentRepository } from '../../infrastructure/persistence/PrismaStudentRepository';
import { ListStudentsUseCase } from '../../application/use-cases/ListStudentsUseCase';
import { CreateStudentUseCase } from '../../application/use-cases/CreateStudentUseCase';
import { ResetStudentPasswordUseCase } from '../../application/use-cases/ResetStudentPasswordUseCase';
import { StudentController } from '../controllers/StudentController';
import { validateRequest } from '../../../../shared/middleware/validateRequest';
import { authenticate } from '../../../../shared/middleware/authenticate';
import { CreateStudentSchema, AdminResetStudentPasswordSchema } from '../../application/dto/StudentDTO';

export function createStudentRouter(): Router {
  const router = Router();
  const studentRepo = new PrismaStudentRepository(prisma);
  const listStudentsUseCase = new ListStudentsUseCase(studentRepo);
  const createStudentUseCase = new CreateStudentUseCase(studentRepo);
  const resetStudentPasswordUseCase = new ResetStudentPasswordUseCase(studentRepo);
  const studentController = new StudentController(
    listStudentsUseCase,
    createStudentUseCase,
    resetStudentPasswordUseCase
  );

  router.get('/', authenticate('institution_user'), studentController.list);
  router.post('/register', validateRequest(CreateStudentSchema), studentController.create);
  router.post(
    '/reset-password',
    validateRequest(AdminResetStudentPasswordSchema),
    studentController.resetPassword
  );
  router.post('/', validateRequest(CreateStudentSchema), studentController.create);

  return router;
}

