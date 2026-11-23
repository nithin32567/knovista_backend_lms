import { AdminDashboardStatsProps } from '../entities/AdminDashboardStats';

export interface IDashboardRepository {
  getAdminStats(userId: number, role?: string): Promise<AdminDashboardStatsProps>;
}

