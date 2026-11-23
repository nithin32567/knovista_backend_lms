import { Request, Response, NextFunction } from 'express';
import { ListStudentsUseCase } from '../../application/use-cases/ListStudentsUseCase';
import { CreateStudentUseCase } from '../../application/use-cases/CreateStudentUseCase';
import { ResetStudentPasswordUseCase } from '../../application/use-cases/ResetStudentPasswordUseCase';
import {
  ListStudentsQuerySchema,
  CreateStudentInput,
  AdminResetStudentPasswordInput,
} from '../../application/dto/StudentDTO';
import { sendSuccess } from '../../../../shared/utils/response';

export class StudentController {
  constructor(
    private readonly listStudentsUseCase: ListStudentsUseCase,
    private readonly createStudentUseCase: CreateStudentUseCase,
    private readonly resetStudentPasswordUseCase?: ResetStudentPasswordUseCase | undefined
  ) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedQuery = ListStudentsQuerySchema.parse(req.query);
      const isSalesAnalyst = req.user?.role === 'Sales Analyst';
      const creatorId = isSalesAnalyst ? req.user?.id : undefined;

      const result = await this.listStudentsUseCase.execute(parsedQuery, creatorId);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as CreateStudentInput;
      const creatorId = req.user?.id ?? 1;

      const student = await this.createStudentUseCase.execute(input, creatorId);

      sendSuccess(
        res,
        { student },
        'Student registered successfully.',
        201
      );
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.resetStudentPasswordUseCase) {
        throw new Error('Reset password use case not configured');
      }

      const input = req.body as AdminResetStudentPasswordInput;
      const currentUserId = req.user?.id;
      const result = await this.resetStudentPasswordUseCase.execute(input, currentUserId);

      sendSuccess(res, null, result.message);
    } catch (error) {
      next(error);
    }
  };
}

