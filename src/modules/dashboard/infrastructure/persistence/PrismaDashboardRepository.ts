import { PrismaClient } from '@prisma/client';
import { IDashboardRepository } from '../../domain/repositories/IDashboardRepository';
import { AdminDashboardStatsProps } from '../../domain/entities/AdminDashboardStats';

export class PrismaDashboardRepository implements IDashboardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getAdminStats(userId: number, role?: string): Promise<AdminDashboardStatsProps> {
    const isSalesAnalyst = role === 'Sales Analyst';
    const studentWhereBase = isSalesAnalyst
      ? { created_by: BigInt(userId) }
      : {};

    let totalStudents = 0;
    let activeStudents = 0;
    let droppedStudents = 0;
    let blockedStudents = 0;
    let totalUsers = 0;
    let totalPrograms = 0;
    let totalBatches = 0;

    try {
      const counts = await Promise.all([
        this.prisma.students.count({
          where: {
            ...studentWhereBase,
            status: { not: 'Deleted' },
          },
        }),
        this.prisma.students.count({
          where: {
            ...studentWhereBase,
            status: 'Active',
          },
        }),
        this.prisma.students.count({
          where: {
            ...studentWhereBase,
            status: 'Dropped',
          },
        }),
        this.prisma.students.count({
          where: {
            ...studentWhereBase,
            status: 'Blocked',
          },
        }),
        this.prisma.institution_users.count({
          where: {
            status: { not: 'Deleted' },
          },
        }),
        this.prisma.programs.count({
          where: {
            status: { not: 'Deleted' },
          },
        }),
        this.prisma.program_section_batches.count({
          where: {
            status: { not: 'Deleted' },
          },
        }),
      ]);

      totalStudents = counts[0] ?? 0;
      activeStudents = counts[1] ?? 0;
      droppedStudents = counts[2] ?? 0;
      blockedStudents = counts[3] ?? 0;
      totalUsers = counts[4] ?? 0;
      totalPrograms = counts[5] ?? 0;
      totalBatches = counts[6] ?? 0;
    } catch {
      totalStudents = 0;
      activeStudents = 0;
      droppedStudents = 0;
      blockedStudents = 0;
      totalUsers = 0;
      totalPrograms = 0;
      totalBatches = 0;
    }

    return {
      total_students: totalStudents,
      total_batches: totalBatches,
      total_programs: totalPrograms,
      total_tickets: 0,
      ticket_status_counts: {
        Closed: 0,
        Open: 0,
      },
      total_users: totalUsers,
      module_unlock_requests: 0,
      module_unlock_status_counts: {
        new: 0,
        pending: 0,
        active: 0,
        completed: 0,
      },
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
      blocked_students: blockedStudents,
      active_students: activeStudents,
      dropped_students: droppedStudents,
      student_status_counts_by_batch: [],
    };
  }
}
