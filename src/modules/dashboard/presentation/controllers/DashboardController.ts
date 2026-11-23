import { Request, Response, NextFunction } from 'express';
import { GetAdminDashboardStatsUseCase } from '../../application/use-cases/GetAdminDashboardStatsUseCase';
import { sendSuccess } from '../../../../shared/utils/response';

export class DashboardController {
  constructor(private readonly getAdminDashboardStatsUseCase: GetAdminDashboardStatsUseCase) {}

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
}

