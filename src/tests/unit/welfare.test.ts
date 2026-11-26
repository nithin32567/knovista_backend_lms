import { describe, it, expect, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { StudentLeave } from '../../modules/welfare/domain/entities/StudentLeave';
import { StudentReport } from '../../modules/welfare/domain/entities/StudentReport';
import { StudentReportHead } from '../../modules/welfare/domain/entities/StudentReportHead';
import { IStudentLeaveRepository } from '../../modules/welfare/domain/repositories/IStudentLeaveRepository';
import { IStudentReportRepository } from '../../modules/welfare/domain/repositories/IStudentReportRepository';
import { IAdminNotificationRepository } from '../../modules/notification/domain/repositories/IAdminNotificationRepository';
import { AdminNotification } from '../../modules/notification/domain/entities/AdminNotification';
import { StudentNotification } from '../../modules/notification/domain/entities/StudentNotification';
import { IStudentNotificationWriter } from '../../modules/notification/infrastructure/persistence/PrismaStudentNotificationRepository';
import { CreateLeaveUseCase } from '../../modules/welfare/application/use-cases/leaves/CreateLeaveUseCase';
import { AuthorizeLeaveUseCase } from '../../modules/welfare/application/use-cases/leaves/AuthorizeLeaveUseCase';
import { ListLeavesUseCase } from '../../modules/welfare/application/use-cases/leaves/ListLeavesUseCase';
import { GetLeaveProofUseCase } from '../../modules/welfare/application/use-cases/leaves/GetLeaveProofUseCase';
import { CreateStudentReportUseCase } from '../../modules/welfare/application/use-cases/reports/CreateStudentReportUseCase';
import { ListStudentReportsUseCase } from '../../modules/welfare/application/use-cases/reports/ListStudentReportsUseCase';
import { GetReportHeadsUseCase } from '../../modules/welfare/application/use-cases/reports/GetReportHeadsUseCase';
import { DeleteStudentReportUseCase } from '../../modules/welfare/application/use-cases/reports/DeleteStudentReportUseCase';
import { ForbiddenError } from '../../shared/errors/ForbiddenError';
import { NotFoundError } from '../../shared/errors/NotFoundError';
import { AppError } from '../../shared/errors/AppError';

function createDummyLeave(overrides: Partial<{
  id: number;
  studentId: number;
  status: string;
  proof: string | null;
  authorizedBy: number | null;
  authorizationRemark: string | null;
}> = {}): StudentLeave {
  return new StudentLeave({
    id: overrides.id ?? 1,
    studentId: overrides.studentId ?? 10,
    startDate: new Date('2026-11-26T00:00:00.000Z'),
    endDate: new Date('2026-11-28T00:00:00.000Z'),
    noOfDays: 3,
    reasonId: 2,
    description: 'Medical rest',
    proof: overrides.proof !== undefined ? overrides.proof : 'leaves/proof-1.pdf',
    status: overrides.status ?? 'pending',
    authorizedBy: overrides.authorizedBy ?? null,
    authorizationRemark: overrides.authorizationRemark ?? null,
    createdBy: null,
    updatedBy: null,
    createdAt: new Date('2026-11-25T10:00:00.000Z'),
    updatedAt: new Date('2026-11-25T10:00:00.000Z'),
  });
}

describe('Welfare Module Unit Tests', () => {
  describe('Student Leaves Use Cases', () => {
    it('CreateLeaveUseCase calculates days, saves leave, and notifies batch tutor', async () => {
      const createdLeave = createDummyLeave();
      const leaveRepo: IStudentLeaveRepository = {
        create: vi.fn().mockResolvedValue(createdLeave),
        findById: vi.fn(),
        authorize: vi.fn(),
        findAll: vi.fn(),
        findByStudentIds: vi.fn(),
        findByStudentId: vi.fn(),
      };
      const adminNotifRepo: IAdminNotificationRepository = {
        create: vi.fn().mockResolvedValue(
          new AdminNotification({
            id: 1,
            userId: 5,
            message: 'notif',
            status: 'new',
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ),
        findByUserId: vi.fn(),
        markAsRead: vi.fn(),
      };
      const mockPrisma = {
        students: {
          findUnique: vi.fn().mockResolvedValue({
            id: BigInt(10),
            first_name: 'Alice',
            last_name: 'Smith',
            status: 'Active',
          }),
        },
        leave_reasons: {
          findUnique: vi.fn().mockResolvedValue({ id: BigInt(2), status: 'active' }),
        },
        student_sections: {
          findFirst: vi.fn().mockResolvedValue({ batch_id: BigInt(7) }),
        },
        program_section_batches: {
          findUnique: vi.fn().mockResolvedValue({ tutor_id: BigInt(5) }),
        },
      } as unknown as PrismaClient;

      const useCase = new CreateLeaveUseCase(leaveRepo, adminNotifRepo, mockPrisma);
      const result = await useCase.execute(
        {
          student_id: 10,
          start_date: '2026-11-26',
          end_date: '2026-11-28',
          reason_id: 2,
          description: 'Medical rest',
        },
        'leaves/proof-1.pdf',
        null,
      );

      expect(leaveRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          studentId: 10,
          noOfDays: 3,
          proofPath: 'leaves/proof-1.pdf',
        }),
      );
      expect(adminNotifRepo.create).toHaveBeenCalledWith({
        userId: 5,
        message: 'Alice Smith has submitted a leave request from 2026-11-26 to 2026-11-28.',
      });
      expect(result.status).toBe('pending');
      expect(result.proof).toContain('/api/student-leaves/1/proof');
    });

    it('CreateLeaveUseCase throws NotFoundError when student or reason does not exist', async () => {
      const leaveRepo = {} as IStudentLeaveRepository;
      const adminNotifRepo = {} as IAdminNotificationRepository;
      const mockPrisma = {
        students: { findUnique: vi.fn().mockResolvedValue(null) },
        leave_reasons: { findUnique: vi.fn().mockResolvedValue({ id: BigInt(2), status: 'active' }) },
      } as unknown as PrismaClient;

      const useCase = new CreateLeaveUseCase(leaveRepo, adminNotifRepo, mockPrisma);
      await expect(
        useCase.execute(
          {
            student_id: 999,
            start_date: '2026-11-26',
            end_date: '2026-11-26',
            reason_id: 2,
          },
          null,
          null,
        ),
      ).rejects.toThrow(NotFoundError);
    });

    it('AuthorizeLeaveUseCase approves pending leave and creates StudentNotification', async () => {
      const pendingLeave = createDummyLeave({ status: 'pending' });
      const approvedLeave = createDummyLeave({
        status: 'approved',
        authorizedBy: 3,
        authorizationRemark: 'Get well soon',
      });
      const leaveRepo: IStudentLeaveRepository = {
        create: vi.fn(),
        findById: vi.fn().mockResolvedValue(pendingLeave),
        authorize: vi.fn().mockResolvedValue(approvedLeave),
        findAll: vi.fn(),
        findByStudentIds: vi.fn(),
        findByStudentId: vi.fn(),
      };
      const studentNotifWriter: IStudentNotificationWriter = {
        create: vi.fn().mockResolvedValue(
          new StudentNotification({
            id: 1,
            studentId: 10,
            title: 'Leave Request Approved',
            message: 'ok',
            status: 'new',
            type: 'leave',
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ),
      };

      const useCase = new AuthorizeLeaveUseCase(leaveRepo, studentNotifWriter);
      const result = await useCase.execute(
        1,
        { status: 'approved', authorization_remark: 'Get well soon' },
        3,
      );

      expect(result.status).toBe('approved');
      expect(result.authorized_by).toBe(3);
      expect(studentNotifWriter.create).toHaveBeenCalledWith({
        studentId: 10,
        title: 'Leave Request Approved',
        message: 'Your leave request from 2026-11-26 to 2026-11-28 has been approved. Remark: Get well soon',
        type: 'leave',
      });
    });

    it('AuthorizeLeaveUseCase rejects non-pending leave with 400 AppError', async () => {
      const approvedLeave = createDummyLeave({ status: 'approved' });
      const leaveRepo: IStudentLeaveRepository = {
        create: vi.fn(),
        findById: vi.fn().mockResolvedValue(approvedLeave),
        authorize: vi.fn(),
        findAll: vi.fn(),
        findByStudentIds: vi.fn(),
        findByStudentId: vi.fn(),
      };
      const studentNotifWriter: IStudentNotificationWriter = {
        create: vi.fn(),
      };

      const useCase = new AuthorizeLeaveUseCase(leaveRepo, studentNotifWriter);
      await expect(
        useCase.execute(1, { status: 'rejected' }, 3),
      ).rejects.toThrow(AppError);
      expect(studentNotifWriter.create).not.toHaveBeenCalled();
    });

    it('ListLeavesUseCase enforces student isolation and staff batch scoping', async () => {
      const leaveRepo: IStudentLeaveRepository = {
        create: vi.fn(),
        findById: vi.fn(),
        authorize: vi.fn(),
        findAll: vi.fn().mockResolvedValue([]),
        findByStudentIds: vi.fn().mockResolvedValue([createDummyLeave({ studentId: 10 })]),
        findByStudentId: vi.fn().mockResolvedValue([createDummyLeave({ studentId: 10 })]),
      };
      const mockPrisma = {
        students: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: BigInt(10),
              first_name: 'Alice',
              last_name: 'Smith',
              email: 'alice@example.com',
              mobile_no: '9999999999',
            },
          ]),
        },
        student_sections: {
          findMany: vi.fn().mockResolvedValue([
            {
              student_id: BigInt(10),
              batch: {
                id: BigInt(7),
                batch_name: 'Cohort A',
                start_date: new Date('2026-01-01T00:00:00.000Z'),
                end_date: new Date('2026-06-01T00:00:00.000Z'),
                status: 'Active',
                tutor_id: BigInt(5),
              },
            },
          ]),
        },
        program_section_batches: {
          findMany: vi.fn().mockResolvedValue([{ id: BigInt(7) }]),
        },
        institution_users: {
          findMany: vi.fn().mockResolvedValue([]),
        },
        leave_reasons: {
          findMany: vi.fn().mockResolvedValue([{ id: BigInt(2), name: 'Medical' }]),
        },
      } as unknown as PrismaClient;

      const useCase = new ListLeavesUseCase(leaveRepo, mockPrisma);

      await expect(
        useCase.execute({ id: 10, type: 'student' }, { studentId: 11 }),
      ).rejects.toThrow(ForbiddenError);

      const tutorLeaves = await useCase.execute(
        { id: 5, type: 'institution_user', role: 'Tutor' },
        {},
      );
      expect(tutorLeaves).toHaveLength(1);
      expect(tutorLeaves[0]?.batch?.name).toBe('Cohort A');
      expect(tutorLeaves[0]?.reason).toBe('Medical');

      await expect(
        useCase.execute({ id: 5, type: 'institution_user', role: 'Tutor' }, { studentId: 99 }),
      ).rejects.toThrow(ForbiddenError);
    });

    it('GetLeaveProofUseCase blocks path traversal and missing proofs', async () => {
      const leaveRepo: IStudentLeaveRepository = {
        create: vi.fn(),
        findById: vi.fn().mockResolvedValue(createDummyLeave({ proof: '../package.json' })),
        authorize: vi.fn(),
        findAll: vi.fn(),
        findByStudentIds: vi.fn(),
        findByStudentId: vi.fn(),
      };

      const useCase = new GetLeaveProofUseCase(leaveRepo);
      await expect(useCase.execute(1)).rejects.toThrow(NotFoundError);
    });
  });

  describe('Student Reports Use Cases', () => {
    const dummyReport = new StudentReport({
      id: 21,
      studentId: 10,
      reportHeadId: 4,
      description: 'Late submission warning',
      status: 'active',
      createdBy: 3,
      updatedBy: 3,
      createdAt: new Date('2026-11-25T10:00:00.000Z'),
      updatedAt: new Date('2026-11-25T10:00:00.000Z'),
    });

    const dummyHead = new StudentReportHead({
      id: 4,
      name: 'Attendance Issue',
      status: 'active',
      createdBy: 1,
      updatedBy: 1,
      createdAt: new Date('2026-11-25T10:00:00.000Z'),
      updatedAt: new Date('2026-11-25T10:00:00.000Z'),
    });

    it('CreateStudentReportUseCase validates references and returns enriched DTO', async () => {
      const reportRepo: IStudentReportRepository = {
        create: vi.fn().mockResolvedValue(dummyReport),
        findById: vi.fn(),
        softDelete: vi.fn(),
        findAll: vi.fn(),
        findByStudentIds: vi.fn(),
        findActiveHeads: vi.fn(),
      };
      const mockPrisma = {
        students: {
          findUnique: vi.fn().mockResolvedValue({
            id: BigInt(10),
            first_name: 'Alice',
            last_name: 'Smith',
            email: 'alice@example.com',
            mobile_no: '9999999999',
            status: 'Active',
          }),
        },
        student_report_heads: {
          findUnique: vi.fn().mockResolvedValue({
            id: BigInt(4),
            name: 'Attendance Issue',
            status: 'active',
          }),
        },
        institution_users: {
          findUnique: vi.fn().mockResolvedValue({
            id: BigInt(3),
            first_name: 'Sarah',
            last_name: 'Tutor',
            email: 'sarah@knovista.com',
            mobile_no: null,
            role: { name: 'Tutor' },
          }),
        },
      } as unknown as PrismaClient;

      const useCase = new CreateStudentReportUseCase(reportRepo, mockPrisma);
      const created = await useCase.execute(
        { student_id: 10, report_head_id: 4, description: 'Late submission warning' },
        3,
      );

      expect(created.id).toBe(21);
      expect(created.report_head).toBe('Attendance Issue');
      expect(created.created_by?.mobile_no).toBeNull();
      expect(created.created_by?.role).toBe('Tutor');
    });

    it('GetReportHeadsUseCase, ListStudentReportsUseCase, and DeleteStudentReportUseCase work properly', async () => {
      const reportRepo: IStudentReportRepository = {
        create: vi.fn(),
        findById: vi.fn().mockResolvedValue(dummyReport),
        softDelete: vi.fn().mockResolvedValue(undefined),
        findAll: vi.fn().mockResolvedValue([dummyReport]),
        findByStudentIds: vi.fn().mockResolvedValue([dummyReport]),
        findActiveHeads: vi.fn().mockResolvedValue([dummyHead]),
      };
      const mockPrisma = {
        students: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: BigInt(10),
              first_name: 'Alice',
              last_name: 'Smith',
              email: 'alice@example.com',
              mobile_no: '9999999999',
            },
          ]),
        },
        student_report_heads: {
          findMany: vi.fn().mockResolvedValue([{ id: BigInt(4), name: 'Attendance Issue' }]),
        },
        institution_users: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: BigInt(3),
              first_name: 'Sarah',
              last_name: 'Tutor',
              email: 'sarah@knovista.com',
              mobile_no: null,
              role: { name: 'Tutor' },
            },
          ]),
        },
      } as unknown as PrismaClient;

      const headsUseCase = new GetReportHeadsUseCase(reportRepo);
      const heads = await headsUseCase.execute();
      expect(heads).toHaveLength(1);
      expect(heads[0]?.name).toBe('Attendance Issue');

      const listUseCase = new ListStudentReportsUseCase(reportRepo, mockPrisma);
      const filtered = await listUseCase.execute(
        { id: 1, type: 'institution_user', role: 'Admin' },
        { role: 'Tutor' },
      );
      expect(filtered).toHaveLength(1);

      const nonMatching = await listUseCase.execute(
        { id: 1, type: 'institution_user', role: 'Admin' },
        { role: 'Quality Analyst' },
      );
      expect(nonMatching).toHaveLength(0);

      const deleteUseCase = new DeleteStudentReportUseCase(reportRepo);
      await deleteUseCase.execute(21, 1);
      expect(reportRepo.softDelete).toHaveBeenCalledWith(21, 1);

      reportRepo.findById = vi.fn().mockResolvedValue(
        new StudentReport({
          id: 21,
          studentId: 10,
          reportHeadId: 4,
          description: null,
          status: 'deleted',
          createdBy: 3,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );
      await expect(deleteUseCase.execute(21, 1)).rejects.toThrow(NotFoundError);
    });
  });
});

