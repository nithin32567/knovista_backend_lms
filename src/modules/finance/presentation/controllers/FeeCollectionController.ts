import { Request, Response, NextFunction } from 'express';
import { ListFeeCollectionsUseCase } from '../../application/use-cases/ListFeeCollectionsUseCase';
import { CreateFeeScheduleUseCase } from '../../application/use-cases/CreateFeeScheduleUseCase';
import { GetFeeCollectionUseCase } from '../../application/use-cases/GetFeeCollectionUseCase';
import { CollectFeeUseCase } from '../../application/use-cases/CollectFeeUseCase';
import { ApproveFeeCollectionUseCase } from '../../application/use-cases/ApproveFeeCollectionUseCase';
import { UpdateFeeInstallmentUseCase } from '../../application/use-cases/UpdateFeeInstallmentUseCase';
import { DeleteFeeInstallmentUseCase } from '../../application/use-cases/DeleteFeeInstallmentUseCase';
import { CancelFeeUseCase } from '../../application/use-cases/CancelFeeUseCase';
import { sendSuccess } from '../../../../shared/utils/response';
import {
  FeeCollectionQuerySchema,
  CreateFeeScheduleInput,
  CollectFeeInput,
  ApproveFeeInput,
  UpdateInstallmentInput,
  DeleteInstallmentInput,
  CancelFeeInput,
} from '../../application/dto/FeeCollectionDTO';
import { FeeCollectionFilter } from '../../domain/repositories/IFeeCollectionRepository';
import { AppError } from '../../../../shared/errors/AppError';

export class FeeCollectionController {
  constructor(
    private readonly listFeeCollectionsUseCase: ListFeeCollectionsUseCase,
    private readonly createFeeScheduleUseCase: CreateFeeScheduleUseCase,
    private readonly getFeeCollectionUseCase: GetFeeCollectionUseCase,
    private readonly collectFeeUseCase: CollectFeeUseCase,
    private readonly approveFeeCollectionUseCase: ApproveFeeCollectionUseCase,
    private readonly updateFeeInstallmentUseCase: UpdateFeeInstallmentUseCase,
    private readonly deleteFeeInstallmentUseCase: DeleteFeeInstallmentUseCase,
    private readonly cancelFeeUseCase: CancelFeeUseCase,
  ) {}

  index = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = FeeCollectionQuerySchema.safeParse(req.query);

      if (!parsed.success) {
        next(new AppError(parsed.error.errors[0]?.message ?? 'Invalid query parameters', 422));
        return;
      }

      const filter: FeeCollectionFilter = {};

      if (parsed.data.student_id !== undefined) {
        filter.studentId = parsed.data.student_id;
      }

      if (parsed.data.student_section_id !== undefined) {
        filter.studentSectionId = parsed.data.student_section_id;
      }

      if (parsed.data.fee_status !== undefined) {
        filter.feeStatus = parsed.data.fee_status;
      }

      if (parsed.data.approval_status !== undefined) {
        filter.approvalStatus = parsed.data.approval_status;
      }

      if (parsed.data.date_from !== undefined) {
        filter.dateFrom = parsed.data.date_from;
      }

      if (parsed.data.date_to !== undefined) {
        filter.dateTo = parsed.data.date_to;
      }

      const result = await this.listFeeCollectionsUseCase.execute(filter);

      sendSuccess(res, result, 'Fee collections retrieved successfully');
    } catch (err) {
      next(err);
    }
  };

  store = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        next(new AppError('Authenticated user not found', 401));
        return;
      }

      const input = req.body as CreateFeeScheduleInput;
      const result = await this.createFeeScheduleUseCase.execute(input, userId);

      sendSuccess(res, result, 'Fee schedule created successfully', 201);
    } catch (err) {
      next(err);
    }
  };

  show = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] ?? '', 10);

      if (isNaN(id) || id <= 0) {
        next(new AppError('Invalid fee collection ID', 422));
        return;
      }

      const result = await this.getFeeCollectionUseCase.execute(id);
      sendSuccess(res, result, 'Fee collection retrieved successfully');
    } catch (err) {
      next(err);
    }
  };

  collectFee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        next(new AppError('Authenticated user not found', 401));
        return;
      }

      const input = req.body as CollectFeeInput;
      const result = await this.collectFeeUseCase.execute(input, userId);

      sendSuccess(res, result, 'Fee collected successfully');
    } catch (err) {
      next(err);
    }
  };

  approveFee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        next(new AppError('Authenticated user not found', 401));
        return;
      }

      const input = req.body as ApproveFeeInput;
      const result = await this.approveFeeCollectionUseCase.execute(input, userId);

      sendSuccess(res, result, 'Fee collection approval processed successfully');
    } catch (err) {
      next(err);
    }
  };

  updateInstallment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        next(new AppError('Authenticated user not found', 401));
        return;
      }

      const input = req.body as UpdateInstallmentInput;
      const result = await this.updateFeeInstallmentUseCase.execute(input, userId);

      sendSuccess(res, result, 'Fee installment updated successfully');
    } catch (err) {
      next(err);
    }
  };

  deleteInstallment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as DeleteInstallmentInput;
      await this.deleteFeeInstallmentUseCase.execute(input);

      sendSuccess(res, null, 'Fee installment deleted successfully');
    } catch (err) {
      next(err);
    }
  };

  cancelFee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        next(new AppError('Authenticated user not found', 401));
        return;
      }

      const input = req.body as CancelFeeInput;
      const result = await this.cancelFeeUseCase.execute(input, userId);

      sendSuccess(res, result, 'Fee installment cancelled successfully');
    } catch (err) {
      next(err);
    }
  };
}
