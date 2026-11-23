import { describe, it, expect, vi } from 'vitest';
import { GetAdminDashboardStatsUseCase } from '../../modules/dashboard/application/use-cases/GetAdminDashboardStatsUseCase';
import { IDashboardRepository } from '../../modules/dashboard/domain/repositories/IDashboardRepository';
import { AdminDashboardStatsProps } from '../../modules/dashboard/domain/entities/AdminDashboardStats';

describe('GetAdminDashboardStatsUseCase', () => {
  const mockStats: AdminDashboardStatsProps = {
    total_students: 5,
    total_batches: 0,
    total_programs: 0,
    total_tickets: 0,
    ticket_status_counts: { Closed: 0, Open: 0 },
    total_users: 2,
    module_unlock_requests: 0,
    module_unlock_status_counts: { new: 0, pending: 0, active: 0, completed: 0 },
    suggestions: 0,
    suggestions_by_status: {
      new: { count: 0, recent: [] },
      accepted: { count: 0, recent: [] },
      rejected: { count: 0, recent: [] },
      completed: { count: 0, recent: [] },
    },
    extension_requests: 0,
    extension_requests_by_status: {
      new: { count: 0, recent: [] },
      accepted: { count: 0, recent: [] },
      rejected: { count: 0, recent: [] },
      completed: { count: 0, recent: [] },
    },
    blocked_students: 0,
    active_students: 5,
    dropped_students: 0,
    student_status_counts_by_batch: [],
  };

  const mockRepo: IDashboardRepository = {
    getAdminStats: vi.fn().mockResolvedValue(mockStats),
  };

  it('should return admin dashboard statistics from repository', async () => {
    const useCase = new GetAdminDashboardStatsUseCase(mockRepo);
    const result = await useCase.execute(1, 'Admin');

    expect(mockRepo.getAdminStats).toHaveBeenCalledWith(1, 'Admin');
    expect(result.total_students).toBe(5);
    expect(result.total_users).toBe(2);
    expect(result.active_students).toBe(5);
  });
});

