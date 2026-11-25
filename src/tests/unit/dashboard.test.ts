import { describe, it, expect, vi } from 'vitest';
import { GetAdminDashboardStatsUseCase } from '../../modules/dashboard/application/use-cases/GetAdminDashboardStatsUseCase';
import { GetLeaveReasonsUseCase } from '../../modules/welfare/application/use-cases/GetLeaveReasonsUseCase';
import { IDashboardRepository } from '../../modules/dashboard/domain/repositories/IDashboardRepository';
import { ILeaveReasonRepository } from '../../modules/welfare/domain/repositories/ILeaveReasonRepository';
import { AdminDashboardStatsProps } from '../../modules/dashboard/domain/entities/AdminDashboardStats';
import { LeaveReason } from '../../modules/welfare/domain/entities/LeaveReason';

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

describe('GetLeaveReasonsUseCase', () => {
  const mockReasons = [
    new LeaveReason({
      id: 1,
      name: 'Medical Leave',
      status: 'active',
      createdBy: 1,
      updatedBy: 1,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    }),
  ];

  const mockLeaveReasonRepo: ILeaveReasonRepository = {
    findActiveReasons: vi.fn().mockResolvedValue(mockReasons),
  };

  it('should return formatted leave reasons list', async () => {
    const useCase = new GetLeaveReasonsUseCase(mockLeaveReasonRepo);
    const result = await useCase.execute();

    expect(mockLeaveReasonRepo.findActiveReasons).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Medical Leave');
    expect(result[0]?.status).toBe('active');
  });
});
