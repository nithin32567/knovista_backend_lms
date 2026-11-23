import { Request, Response, NextFunction } from 'express';
import { ListInstitutionUsersUseCase } from '../../application/use-cases/ListInstitutionUsersUseCase';
import { CreateInstitutionUserUseCase } from '../../application/use-cases/CreateInstitutionUserUseCase';
import { GetActiveRolesUseCase } from '../../application/use-cases/GetActiveRolesUseCase';
import { GetUsersByRoleUseCase } from '../../application/use-cases/GetUsersByRoleUseCase';
import { GetRolePermissionsUseCase } from '../../application/use-cases/GetRolePermissionsUseCase';
import {
  ListInstitutionUsersQuerySchema,
  GetUsersByRoleQuerySchema,
  CreateInstitutionUserSchema,
  CreateInstitutionUserInput,
} from '../../application/dto/InstitutionUserDTO';
import { sendSuccess } from '../../../../shared/utils/response';

export class InstitutionUserController {
  constructor(
    private readonly listUsersUseCase: ListInstitutionUsersUseCase,
    private readonly createUserUseCase: CreateInstitutionUserUseCase,
    private readonly getActiveRolesUseCase: GetActiveRolesUseCase,
    private readonly getUsersByRoleUseCase: GetUsersByRoleUseCase,
    private readonly getRolePermissionsUseCase: GetRolePermissionsUseCase
  ) {}

  index = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedQuery = ListInstitutionUsersQuerySchema.parse(req.query);
      const data = await this.listUsersUseCase.execute(parsedQuery);
      sendSuccess(res, data, 'Institution users retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  store = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedInput = CreateInstitutionUserSchema.parse(req.body) as CreateInstitutionUserInput;
      const creatorId = req.user?.id ?? 1;
      const profilePic = req.file?.filename ?? undefined;

      const user = await this.createUserUseCase.execute(validatedInput, creatorId, profilePic);
      sendSuccess(res, user, 'Institution user created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  getActiveRoles = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roles = await this.getActiveRolesUseCase.execute();
      sendSuccess(res, roles, 'Active institution roles retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getByRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = GetUsersByRoleQuerySchema.parse(req.query);
      const users = await this.getUsersByRoleUseCase.execute(parsed.role);
      sendSuccess(res, users, 'Users by role retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roleName = req.user?.role ?? 'Admin';
      const result = await this.getRolePermissionsUseCase.execute(roleName);
      res.status(200).json({
        success: true,
        role: result.role,
        permissions: result.permissions,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
