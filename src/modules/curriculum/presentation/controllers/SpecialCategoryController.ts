import { Request, Response, NextFunction } from 'express';
import { ListSpecialCategoriesUseCase } from '../../application/use-cases/special-categories/ListSpecialCategoriesUseCase';
import { CreateSpecialCategoryUseCase } from '../../application/use-cases/special-categories/CreateSpecialCategoryUseCase';
import { GetSpecialCategoryUseCase } from '../../application/use-cases/special-categories/GetSpecialCategoryUseCase';
import { UpdateSpecialCategoryUseCase } from '../../application/use-cases/special-categories/UpdateSpecialCategoryUseCase';
import { SpecialCategoryQuerySchema, CreateSpecialCategoryInput, UpdateSpecialCategoryInput } from '../../application/dto/SpecialCategoryDTO';
import { sendSuccess } from '../../../../shared/utils/response';

export class SpecialCategoryController {
  constructor(
    private readonly listSpecialCategoriesUseCase: ListSpecialCategoriesUseCase,
    private readonly createSpecialCategoryUseCase: CreateSpecialCategoryUseCase,
    private readonly getSpecialCategoryUseCase: GetSpecialCategoryUseCase,
    private readonly updateSpecialCategoryUseCase: UpdateSpecialCategoryUseCase
  ) {}

  index = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = SpecialCategoryQuerySchema.parse(req.query);
      const categories = await this.listSpecialCategoriesUseCase.execute(query.status);
      sendSuccess(res, categories, 'Special categories retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  store = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as CreateSpecialCategoryInput;
      const creatorId = req.user?.id ?? 1;
      const category = await this.createSpecialCategoryUseCase.execute(input, creatorId);
      sendSuccess(res, category, 'Special category created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  show = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] ?? '0', 10);
      const category = await this.getSpecialCategoryUseCase.execute(id);
      sendSuccess(res, category, 'Special category retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] ?? '0', 10);
      const input = req.body as UpdateSpecialCategoryInput;
      const updaterId = req.user?.id ?? 1;
      const category = await this.updateSpecialCategoryUseCase.execute(id, input, updaterId);
      sendSuccess(res, category, 'Special category updated successfully');
    } catch (error) {
      next(error);
    }
  };
}

