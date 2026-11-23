import { Router } from 'express';
import { prisma } from '../../../../config/database';
import { PrismaStudentRepository } from '../../infrastructure/persistence/PrismaStudentRepository';
import { PrismaInstitutionUserRepository } from '../../infrastructure/persistence/PrismaInstitutionUserRepository';
import { PrismaPasswordResetRepository } from '../../infrastructure/persistence/PrismaPasswordResetRepository';
import { StudentLoginUseCase } from '../../application/use-cases/StudentLoginUseCase';
import { StudentRegisterUseCase } from '../../application/use-cases/StudentRegisterUseCase';
import { GetStudentProfileUseCase } from '../../application/use-cases/GetStudentProfileUseCase';
import { ForgotPasswordUseCase } from '../../application/use-cases/ForgotPasswordUseCase';
import { ResetPasswordUseCase } from '../../application/use-cases/ResetPasswordUseCase';
import { ChangePasswordUseCase } from '../../application/use-cases/ChangePasswordUseCase';
import { StaffLoginUseCase } from '../../application/use-cases/StaffLoginUseCase';
import { GetStaffProfileUseCase } from '../../application/use-cases/GetStaffProfileUseCase';
import { StudentAuthController } from '../controllers/StudentAuthController';
import { StaffAuthController } from '../controllers/StaffAuthController';
import { validateRequest } from '../../../../shared/middleware/validateRequest';
import { authenticate } from '../../../../shared/middleware/authenticate';
import { authRateLimiter } from '../../../../shared/middleware/rateLimiter';
import {
  StudentLoginSchema,
  StudentRegisterSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
} from '../../application/dto/StudentAuthDTO';
import { StaffLoginSchema } from '../../application/dto/StaffAuthDTO';

export function createAuthRouter(): Router {
  const router = Router();

  const studentRepo = new PrismaStudentRepository(prisma);
  const staffRepo = new PrismaInstitutionUserRepository(prisma);
  const passwordResetRepo = new PrismaPasswordResetRepository(prisma);

  const studentLoginUseCase = new StudentLoginUseCase(studentRepo);
  const studentRegisterUseCase = new StudentRegisterUseCase(studentRepo);
  const getStudentProfileUseCase = new GetStudentProfileUseCase(studentRepo);
  const forgotPasswordUseCase = new ForgotPasswordUseCase(studentRepo, passwordResetRepo);
  const resetPasswordUseCase = new ResetPasswordUseCase(studentRepo, passwordResetRepo);
  const changePasswordUseCase = new ChangePasswordUseCase(studentRepo);

  const staffLoginUseCase = new StaffLoginUseCase(staffRepo);
  const getStaffProfileUseCase = new GetStaffProfileUseCase(staffRepo);

  const studentController = new StudentAuthController(
    studentLoginUseCase,
    studentRegisterUseCase,
    getStudentProfileUseCase,
    forgotPasswordUseCase,
    resetPasswordUseCase,
    changePasswordUseCase
  );

  const staffController = new StaffAuthController(
    staffLoginUseCase,
    getStaffProfileUseCase
  );

  router.post(
    '/student/login',
    authRateLimiter,
    validateRequest(StudentLoginSchema),
    studentController.login
  );

  router.post(
    '/student/register',
    authRateLimiter,
    validateRequest(StudentRegisterSchema),
    studentController.register
  );

  router.get(
    '/student/profile',
    authenticate('student'),
    studentController.getProfile
  );

  router.post(
    '/student/forgot-password',
    authRateLimiter,
    validateRequest(ForgotPasswordSchema),
    studentController.forgotPassword
  );

  router.post(
    '/student/reset-password',
    validateRequest(ResetPasswordSchema),
    studentController.resetPassword
  );

  router.post(
    '/student/change-password',
    authenticate('student'),
    validateRequest(ChangePasswordSchema),
    studentController.changePassword
  );

  router.post(
    '/staff/login',
    authRateLimiter,
    validateRequest(StaffLoginSchema),
    staffController.login
  );

  router.post(
    '/institution-user/login',
    authRateLimiter,
    validateRequest(StaffLoginSchema),
    staffController.login
  );

  router.get(
    '/staff/profile',
    authenticate('institution_user'),
    staffController.getProfile
  );

  router.get(
    '/institution-user/profile',
    authenticate('institution_user'),
    staffController.getProfile
  );

  return router;
}
