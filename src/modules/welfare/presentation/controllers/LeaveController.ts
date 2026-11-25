import { Request, Response, NextFunction } from 'express';
import { GetLeaveReasonsUseCase } from '../../application/use-cases/GetLeaveReasonsUseCase';
import { sendSuccess } from '../../../../shared/utils/response';

export class LeaveController {
  constructor(private readonly getLeaveReasonsUseCase: GetLeaveReasonsUseCase) {}

  getLeaveReasons = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reasons = await this.getLeaveReasonsUseCase.execute();
      sendSuccess(res, reasons, 'Leave reasons retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}

