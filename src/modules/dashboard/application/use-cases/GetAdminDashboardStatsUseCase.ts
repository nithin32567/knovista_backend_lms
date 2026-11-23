import { IDashboardRepository } from '../../domain/repositories/IDashboardRepository';
import { AdminDashboardStatsProps } from '../../domain/entities/AdminDashboardStats';

export class GetAdminDashboardStatsUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}

  async execute(userId: number, role?: string): Promise<AdminDashboardStatsProps> {
    return this.dashboardRepository.getAdminStats(userId, role);
  }
}

