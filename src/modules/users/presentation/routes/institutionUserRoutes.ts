import { Router } from 'express';
import { prisma } from '../../../../config/database';
import { PrismaInstitutionUserRepository } from '../../infrastructure/persistence/PrismaInstitutionUserRepository';
import { PrismaInstitutionRoleRepository } from '../../infrastructure/persistence/PrismaInstitutionRoleRepository';
import { ListInstitutionUsersUseCase } from '../../application/use-cases/ListInstitutionUsersUseCase';
import { CreateInstitutionUserUseCase } from '../../application/use-cases/CreateInstitutionUserUseCase';
import { GetActiveRolesUseCase } from '../../application/use-cases/GetActiveRolesUseCase';
import { GetUsersByRoleUseCase } from '../../application/use-cases/GetUsersByRoleUseCase';
import { GetRolePermissionsUseCase } from '../../application/use-cases/GetRolePermissionsUseCase';
import { InstitutionUserController } from '../controllers/InstitutionUserController';
import { authenticate } from '../../../../shared/middleware/authenticate';
import { handleOptionalProfilePic } from '../../../../shared/middleware/uploadMiddleware';

export function createInstitutionUserRouter(): Router {
  const router = Router();

  const userRepo = new PrismaInstitutionUserRepository(prisma);
  const roleRepo = new PrismaInstitutionRoleRepository(prisma);

  const listUsersUseCase = new ListInstitutionUsersUseCase(userRepo);
  const createUserUseCase = new CreateInstitutionUserUseCase(userRepo, roleRepo);
  const getActiveRolesUseCase = new GetActiveRolesUseCase(roleRepo);
  const getUsersByRoleUseCase = new GetUsersByRoleUseCase(userRepo);
  const getRolePermissionsUseCase = new GetRolePermissionsUseCase();

  const controller = new InstitutionUserController(
    listUsersUseCase,
    createUserUseCase,
    getActiveRolesUseCase,
    getUsersByRoleUseCase,
    getRolePermissionsUseCase
  );

  router.get('/institution-role/permissions', authenticate('institution_user'), controller.getPermissions);
  router.get('/institution-users', authenticate('institution_user'), controller.index);
  router.get('/institution-users/by-role', authenticate('institution_user'), controller.getByRole);
  router.post(
    '/institution-users',
    authenticate('institution_user'),
    handleOptionalProfilePic,
    controller.store
  );
  router.get('/institution-roles/active', authenticate('institution_user'), controller.getActiveRoles);

  return router;
}
