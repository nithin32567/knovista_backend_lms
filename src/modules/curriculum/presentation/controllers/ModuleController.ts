import { Request, Response, NextFunction } from 'express';
import { ListModulesUseCase } from '../../application/use-cases/modules/ListModulesUseCase';
import { CreateModuleUseCase } from '../../application/use-cases/modules/CreateModuleUseCase';
import { GetModuleUseCase } from '../../application/use-cases/modules/GetModuleUseCase';
import { UpdateModuleUseCase } from '../../application/use-cases/modules/UpdateModuleUseCase';
import { ModuleQuerySchema, CreateModuleInput, UpdateModuleInput } from '../../application/dto/ModuleDTO';
import { sendSuccess } from '../../../../shared/utils/response';

export class ModuleController {
  constructor(
    private readonly listModulesUseCase: ListModulesUseCase,
    private readonly createModuleUseCase: CreateModuleUseCase,
    private readonly getModuleUseCase: GetModuleUseCase,
    private readonly updateModuleUseCase: UpdateModuleUseCase
  ) {}

  index = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = ModuleQuerySchema.parse(req.query);
      const modules = await this.listModulesUseCase.execute(query.section_id, query.status);
      sendSuccess(res, modules, 'Modules retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  store = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as CreateModuleInput;
      const creatorId = req.user?.id ?? 1;
      const courseModule = await this.createModuleUseCase.execute(input, creatorId);
      sendSuccess(res, courseModule, 'Module created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  show = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] ?? '0', 10);
      const courseModule = await this.getModuleUseCase.execute(id);
      sendSuccess(res, courseModule, 'Module retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] ?? '0', 10);
      const input = req.body as UpdateModuleInput;
      const updaterId = req.user?.id ?? 1;
      const courseModule = await this.updateModuleUseCase.execute(id, input, updaterId);
      sendSuccess(res, courseModule, 'Module updated successfully');
    } catch (error) {
      next(error);
    }
  };
}

