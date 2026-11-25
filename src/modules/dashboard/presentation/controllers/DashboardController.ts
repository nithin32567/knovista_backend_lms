import { Request, Response, NextFunction } from 'express';
import { GetAdminDashboardStatsUseCase } from '../../application/use-cases/GetAdminDashboardStatsUseCase';
import { GetStudentDashboardUseCase } from '../../application/use-cases/GetStudentDashboardUseCase';
import { GetDailyQuotesUseCase } from '../../application/use-cases/GetDailyQuotesUseCase';
import { StudentDashboardQuerySchema } from '../../application/dto/DashboardDTO';
import { sendSuccess } from '../../../../shared/utils/response';
import { ValidationError } from '../../../../shared/errors/ValidationError';
import { ForbiddenError } from '../../../../shared/errors/ForbiddenError';
import { UnauthorizedError } from '../../../../shared/errors/UnauthorizedError';

export class DashboardController {
  constructor(
    private readonly getAdminDashboardStatsUseCase: GetAdminDashboardStatsUseCase,
    private readonly getStudentDashboardUseCase?: GetStudentDashboardUseCase | undefined,
    private readonly getDailyQuotesUseCase?: GetDailyQuotesUseCase | undefined,
  ) {}

  getAdminStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id ?? 1;
      const role = req.user?.role;
      const stats = await this.getAdminDashboardStatsUseCase.execute(userId, role);
      sendSuccess(res, stats, 'Dashboard stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getStudentDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.getStudentDashboardUseCase) {
        throw new Error('Student dashboard use case not configured');
      }
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const query = StudentDashboardQuerySchema.parse(req.query);
      let studentId: number | undefined;

      if (req.user.type === 'student') {
        if (query.student_id !== undefined && query.student_id !== req.user.id) {
          throw new ForbiddenError('Access denied');
        }
        studentId = req.user.id;
      } else {
        studentId = query.student_id;
      }

      if (!studentId) {
        throw new ValidationError('student_id is required');
      }

      const dashboard = await this.getStudentDashboardUseCase.execute(studentId);
      sendSuccess(res, dashboard, 'Student dashboard retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getDailyQuotes = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.getDailyQuotesUseCase) {
        throw new Error('Daily quotes use case not configured');
      }
      const quotes = await this.getDailyQuotesUseCase.execute();
      sendSuccess(res, quotes, 'Daily quotes retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
