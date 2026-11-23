import { Request, Response, NextFunction } from 'express';
import { ListExtensionsUseCase } from '../../application/use-cases/extensions/ListExtensionsUseCase';
import { CreateExtensionUseCase } from '../../application/use-cases/extensions/CreateExtensionUseCase';
import { GetExtensionUseCase } from '../../application/use-cases/extensions/GetExtensionUseCase';
import { UpdateExtensionUseCase } from '../../application/use-cases/extensions/UpdateExtensionUseCase';
import { ExtensionQuerySchema, CreateExtensionInput, UpdateExtensionInput } from '../../application/dto/ProgramExtensionDTO';
import { sendSuccess } from '../../../../shared/utils/response';

export class ProgramExtensionController {
  constructor(
    private readonly listUseCase: ListExtensionsUseCase,
    private readonly createUseCase: CreateExtensionUseCase,
    private readonly getUseCase: GetExtensionUseCase,
    private readonly updateUseCase: UpdateExtensionUseCase
  ) {}

  index = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = ExtensionQuerySchema.parse(req.query);
      const extensions = await this.listUseCase.execute(query.student_section_id, query.status);
      sendSuccess(res, extensions, 'Extension requests retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  store = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as CreateExtensionInput;
      const requestedBy = req.user?.id ?? 1;
      const extension = await this.createUseCase.execute(input, requestedBy);
      sendSuccess(res, extension, 'Extension requested successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  show = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] ?? '0', 10);
      const extension = await this.getUseCase.execute(id);
      sendSuccess(res, extension, 'Extension request retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] ?? '0', 10);
      const input = req.body as UpdateExtensionInput;
      const reviewerId = req.user?.id ?? 1;
      const extension = await this.updateUseCase.execute(id, input, reviewerId);
      sendSuccess(res, extension, 'Extension request reviewed successfully');
    } catch (error) {
      next(error);
    }
  };
}

