import { Request, Response, NextFunction } from 'express';
import { CompleteStudentTopicUseCase } from '../../application/use-cases/CompleteStudentTopicUseCase';
import { RequestModuleUnlockUseCase } from '../../application/use-cases/RequestModuleUnlockUseCase';
import { ListModuleUnlockRequestsUseCase } from '../../application/use-cases/ListModuleUnlockRequestsUseCase';
import { ApproveModuleUnlockUseCase } from '../../application/use-cases/ApproveModuleUnlockUseCase';
import { CompleteCourseUseCase } from '../../application/use-cases/CompleteCourseUseCase';
import {
  CompleteStudentTopicInput,
  RequestUnlockNextModuleInput,
  ListUnlockRequestsQueryInput,
  ApproveModuleUnlockInput,
  CompleteCourseInput,
} from '../../application/dto/ProgressDTO';
import { sendSuccess } from '../../../../shared/utils/response';

export class ProgressController {
  constructor(
    private readonly completeStudentTopicUseCase: CompleteStudentTopicUseCase,
    private readonly requestModuleUnlockUseCase: RequestModuleUnlockUseCase,
    private readonly listModuleUnlockRequestsUseCase: ListModuleUnlockRequestsUseCase,
    private readonly approveModuleUnlockUseCase: ApproveModuleUnlockUseCase,
    private readonly completeCourseUseCase: CompleteCourseUseCase
  ) {}

  completeTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as CompleteStudentTopicInput;
      const studentId = req.user?.id ? Number(req.user.id) : 0;
      const result = await this.completeStudentTopicUseCase.execute(input, studentId);
      sendSuccess(res, result, 'Topic marked as completed');
    } catch (error) {
      next(error);
    }
  };

  requestUnlock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as RequestUnlockNextModuleInput;
      const result = await this.requestModuleUnlockUseCase.execute(input);
      sendSuccess(res, null, result.message);
    } catch (error) {
      next(error);
    }
  };

  listUnlockRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ListUnlockRequestsQueryInput;
      const result = await this.listModuleUnlockRequestsUseCase.execute(query);
      res.status(200).json({
        success: true,
        message: 'Module unlock requests retrieved successfully',
        data: result.data,
        total: result.total,
        current_page: result.current_page,
        per_page: result.per_page,
        last_page: result.last_page,
      });
    } catch (error) {
      next(error);
    }
  };

  approveUnlock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as ApproveModuleUnlockInput;
      const approverId = req.user?.id ? Number(req.user.id) : 0;
      const result = await this.approveModuleUnlockUseCase.execute(input, approverId);
      sendSuccess(res, null, result.message);
    } catch (error) {
      next(error);
    }
  };

  completeCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as CompleteCourseInput;
      const result = await this.completeCourseUseCase.execute(input);
      sendSuccess(res, null, result.message);
    } catch (error) {
      next(error);
    }
  };
}
