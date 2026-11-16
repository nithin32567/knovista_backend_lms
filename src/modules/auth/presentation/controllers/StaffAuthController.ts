import { Request, Response, NextFunction } from 'express';
import { StaffLoginUseCase } from '../../application/use-cases/StaffLoginUseCase';
import { GetStaffProfileUseCase } from '../../application/use-cases/GetStaffProfileUseCase';
import { sendSuccess } from '../../../../shared/utils/response';
import { UnauthorizedError } from '../../../../shared/errors/UnauthorizedError';

export class StaffAuthController {
  constructor(
    private readonly loginUseCase: StaffLoginUseCase,
    private readonly getProfileUseCase: GetStaffProfileUseCase
  ) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.loginUseCase.execute(req.body);
      sendSuccess(res, result, 'Login successful', 200);
    } catch (err) {
      next(err);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        throw new UnauthorizedError('Authentication required');
      }
      const result = await this.getProfileUseCase.execute(user.id);
      sendSuccess(res, result, 'Profile retrieved successfully', 200);
    } catch (err) {
      next(err);
    }
  };
}

