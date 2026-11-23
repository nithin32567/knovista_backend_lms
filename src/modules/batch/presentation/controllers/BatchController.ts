import { Request, Response, NextFunction } from 'express';
import { ListBatchesUseCase } from '../../application/use-cases/batches/ListBatchesUseCase';
import { CreateBatchUseCase } from '../../application/use-cases/batches/CreateBatchUseCase';
import { GetBatchUseCase } from '../../application/use-cases/batches/GetBatchUseCase';
import { BatchQuerySchema, CreateBatchInput } from '../../application/dto/BatchDTO';
import { sendSuccess } from '../../../../shared/utils/response';

export class BatchController {
  constructor(
    private readonly listBatchesUseCase: ListBatchesUseCase,
    private readonly createBatchUseCase: CreateBatchUseCase,
    private readonly getBatchUseCase: GetBatchUseCase
  ) {}

  index = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = BatchQuerySchema.parse(req.query);
      const batches = await this.listBatchesUseCase.execute(query.section_id, query.status);
      sendSuccess(res, batches, 'Batches retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  store = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as CreateBatchInput;
      const creatorId = req.user?.id ?? 1;
      const batch = await this.createBatchUseCase.execute(input, creatorId);
      sendSuccess(res, batch, 'Batch created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  show = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] ?? '0', 10);
      const batch = await this.getBatchUseCase.execute(id);
      sendSuccess(res, batch, 'Batch retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}

