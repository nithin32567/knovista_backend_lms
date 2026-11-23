import { Request, Response, NextFunction } from 'express';
import { StudentLoginUseCase } from '../../application/use-cases/StudentLoginUseCase';
import { StudentRegisterUseCase } from '../../application/use-cases/StudentRegisterUseCase';
import { GetStudentProfileUseCase } from '../../application/use-cases/GetStudentProfileUseCase';
import { ForgotPasswordUseCase } from '../../application/use-cases/ForgotPasswordUseCase';
import { ResetPasswordUseCase } from '../../application/use-cases/ResetPasswordUseCase';
import { ChangePasswordUseCase } from '../../application/use-cases/ChangePasswordUseCase';
import { sendSuccess } from '../../../../shared/utils/response';
import { UnauthorizedError } from '../../../../shared/errors/UnauthorizedError';

export class StudentAuthController {
  constructor(
    private readonly loginUseCase: StudentLoginUseCase,
    private readonly registerUseCase: StudentRegisterUseCase,
    private readonly getProfileUseCase: GetStudentProfileUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase
  ) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.loginUseCase.execute(req.body);
      sendSuccess(res, result, 'Login successful', 200);
    } catch (err) {
      next(err);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.registerUseCase.execute(req.body);
      sendSuccess(res, result, 'Registration successful', 201);
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

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.forgotPasswordUseCase.execute(req.body);
      sendSuccess(res, null, result.message, 200);
    } catch (err) {
      next(err);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.resetPasswordUseCase.execute(req.body);
      sendSuccess(res, null, result.message, 200);
    } catch (err) {
      next(err);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        throw new UnauthorizedError('Authentication required');
      }
      const result = await this.changePasswordUseCase.execute(user.id, req.body);
      sendSuccess(res, null, result.message, 200);
    } catch (err) {
      next(err);
    }
  };
}
