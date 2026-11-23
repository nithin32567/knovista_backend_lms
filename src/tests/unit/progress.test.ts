import { describe, it, expect, vi } from 'vitest';
import { StudentTopicProgress } from '../../modules/progress/domain/entities/StudentTopicProgress';
import { ModuleUnlockRequest } from '../../modules/progress/domain/entities/ModuleUnlockRequest';
import { ModulePerformance } from '../../modules/progress/domain/entities/ModulePerformance';
import { IProgressRepository } from '../../modules/progress/domain/repositories/IProgressRepository';
import { IPerformanceRepository } from '../../modules/progress/domain/repositories/IPerformanceRepository';
import { IAdminNotificationRepository } from '../../modules/notification/domain/repositories/IAdminNotificationRepository';
import { AdminNotification } from '../../modules/notification/domain/entities/AdminNotification';

import { CompleteStudentTopicUseCase } from '../../modules/progress/application/use-cases/CompleteStudentTopicUseCase';
import { RequestModuleUnlockUseCase } from '../../modules/progress/application/use-cases/RequestModuleUnlockUseCase';
import { ListModuleUnlockRequestsUseCase } from '../../modules/progress/application/use-cases/ListModuleUnlockRequestsUseCase';
import { ApproveModuleUnlockUseCase } from '../../modules/progress/application/use-cases/ApproveModuleUnlockUseCase';
import { RecordPerformanceUseCase } from '../../modules/progress/application/use-cases/RecordPerformanceUseCase';
import { ListPerformanceUseCase } from '../../modules/progress/application/use-cases/ListPerformanceUseCase';
import { GetStudentModulePerformanceUseCase } from '../../modules/progress/application/use-cases/GetStudentModulePerformanceUseCase';
import { CompleteCourseUseCase } from '../../modules/progress/application/use-cases/CompleteCourseUseCase';

describe('Progress & Evaluation Module Unit Tests', () => {
  const dummyTopicProgress = new StudentTopicProgress({
    id: 1,
    studentId: 10,
    studentSectionModuleId: 5,
    topicId: 20,
    status: 'completed',
    createdBy: 1,
    createdAt: new Date(),
    topicStartedBy: 1,
    topicStartedAt: new Date(),
    topicLastAccessedAt: new Date(),
    topicCompletedAt: new Date(),
    topicName: 'Intro to React',
    topicType: 'video',
  });

  const dummyUnlockRequest = new ModuleUnlockRequest({
    studentSectionModuleId: 5,
    studentId: 10,
    studentSectionId: 2,
    moduleId: 3,
    moduleName: 'Advanced React',
    modulePriority: 2,
    status: 'pending',
    unlockRequested: true,
    unlockRequestedBy: 10,
    unlockRequestedAt: new Date(),
    unlockedBy: null,
    unlockedAt: null,
    studentFirstName: 'John',
    studentLastName: 'Doe',
    studentEmail: 'john@example.com',
    studentMobile: '9876543210',
    batchId: 1,
    batchName: 'Batch Alpha 2026',
    sectionId: 1,
    sectionName: 'Full Stack Web',
    programName: 'MERN Stack',
  });

  const dummyPerformance = new ModulePerformance({
    studentSectionModuleId: 5,
    studentId: 10,
    studentSectionId: 2,
    moduleId: 3,
    moduleName: 'Advanced React',
    modulePriority: 2,
    status: 'completed',
    performance: 'excellent',
    performanceDescription: 'Great work on state management',
    performanceCreatedBy: 1,
    performanceCreatedAt: new Date(),
    studentFirstName: 'John',
    studentLastName: 'Doe',
    studentEmail: 'john@example.com',
    studentMobile: '9876543210',
    batchId: 1,
    batchName: 'Batch Alpha 2026',
    sectionId: 1,
    sectionName: 'Full Stack Web',
    selfPlaced: 'no',
    updatedAt: new Date(),
  });

  const mockProgressRepo: IProgressRepository = {
    findTopicProgressById: vi.fn().mockResolvedValue(dummyTopicProgress),
    findTopicProgressByStudentAndTopic: vi.fn().mockResolvedValue(dummyTopicProgress),
    completeTopic: vi.fn().mockResolvedValue(dummyTopicProgress),
    getStudentSectionIdByTopicProgress: vi.fn().mockResolvedValue(2),
    recalculateSectionProgress: vi.fn().mockResolvedValue(50.0),
    requestModuleUnlock: vi.fn().mockResolvedValue({
      success: true,
      tutorId: 2,
      studentName: 'John Doe',
      moduleName: 'Advanced React',
    }),
    listUnlockRequests: vi.fn().mockResolvedValue({
      items: [dummyUnlockRequest],
      total: 1,
    }),
    approveModuleUnlock: vi.fn().mockResolvedValue(true),
    completeCourse: vi.fn().mockResolvedValue(true),
  };

  const mockPerformanceRepo: IPerformanceRepository = {
    savePerformance: vi.fn().mockResolvedValue(dummyPerformance),
    getPerformanceById: vi.fn().mockResolvedValue(dummyPerformance),
    clearPerformance: vi.fn().mockResolvedValue(true),
    listPerformances: vi.fn().mockResolvedValue({
      items: [dummyPerformance],
      isCertificate: true,
    }),
    getStudentModulePerformance: vi.fn().mockResolvedValue({
      student: {
        id: 10,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        mobileNo: '9876543210',
      },
      modules: [
        {
          moduleId: 3,
          moduleName: 'Advanced React',
          modulePriority: 2,
          moduleStatus: 'Active',
          sectionId: 1,
          sectionName: 'Full Stack Web',
          performance: {
            studentSectionModuleId: 5,
            studentSectionId: 2,
            status: 'completed',
            performance: 'excellent',
            performanceDescription: 'Great work',
            performanceCreatedBy: 1,
            performanceCreatedAt: new Date().toISOString(),
          },
        },
      ],
    }),
    getCompletedModules: vi.fn().mockResolvedValue([
      {
        id: 5,
        studentId: 10,
        studentSectionId: 2,
        moduleId: 3,
        moduleName: 'Advanced React',
        completedAt: new Date().toISOString(),
      },
    ]),
  };

  const dummyNotification = new AdminNotification({
    id: 1,
    userId: 2,
    message: 'John Doe has requested to unlock the module "Advanced React".',
    status: 'new',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockNotificationRepo: IAdminNotificationRepository = {
    create: vi.fn().mockResolvedValue(dummyNotification),
    findByUserId: vi.fn().mockResolvedValue([dummyNotification]),
    markAsRead: vi.fn().mockResolvedValue(1),
  };

  it('CompleteStudentTopicUseCase should mark topic as completed and recalculate section progress', async () => {
    const useCase = new CompleteStudentTopicUseCase(mockProgressRepo);
    const result = await useCase.execute({ student_topic_id: 1 }, 10);

    expect(result.id).toBe(1);
    expect(result.status).toBe('completed');
    expect(mockProgressRepo.completeTopic).toHaveBeenCalledWith(1, 10);
    expect(mockProgressRepo.recalculateSectionProgress).toHaveBeenCalledWith(2);
  });

  it('CompleteStudentTopicUseCase should throw NotFoundError when topic does not exist', async () => {
    const failingRepo = {
      ...mockProgressRepo,
      findTopicProgressById: vi.fn().mockResolvedValue(null),
    };
    const useCase = new CompleteStudentTopicUseCase(failingRepo);

    await expect(useCase.execute({ student_topic_id: 999 }, 10)).rejects.toThrow(
      'Student topic not found'
    );
  });

  it('RequestModuleUnlockUseCase should submit unlock request and notify tutor', async () => {
    const useCase = new RequestModuleUnlockUseCase(mockProgressRepo, mockNotificationRepo);
    const result = await useCase.execute({
      student_id: 10,
      section_id: 1,
      next_module_id: 3,
    });

    expect(result.message).toBe('Unlock request for next module submitted successfully');
    expect(mockNotificationRepo.create).toHaveBeenCalledWith({
      userId: 2,
      message: 'John Doe has requested to unlock the module "Advanced React".',
    });
  });

  it('ListModuleUnlockRequestsUseCase should return paginated list of unlock requests', async () => {
    const useCase = new ListModuleUnlockRequestsUseCase(mockProgressRepo);
    const result = await useCase.execute({ page: 1, per_page: 50 });

    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.module_name).toBe('Advanced React');
    expect(result.data[0]?.status).toBe('pending');
  });

  it('ApproveModuleUnlockUseCase should activate module and previous module completion', async () => {
    const useCase = new ApproveModuleUnlockUseCase(mockProgressRepo);
    const result = await useCase.execute(
      {
        student_id: 10,
        section_id: 1,
        student_section_id: 2,
        module_id: 3,
      },
      1
    );

    expect(result.message).toBe('Module unlock approved and activated successfully');
    expect(mockProgressRepo.approveModuleUnlock).toHaveBeenCalledWith(10, 2, 3, 1);
  });

  it('RecordPerformanceUseCase should update student module evaluation grade', async () => {
    const useCase = new RecordPerformanceUseCase(mockPerformanceRepo);
    const result = await useCase.execute(
      {
        student_section_module_id: 5,
        performance: 'excellent',
        performance_description: 'Great work on state management',
      },
      1
    );

    expect(result.performance).toBe('excellent');
    expect(result.student_section_module_id).toBe(5);
    expect(mockPerformanceRepo.savePerformance).toHaveBeenCalledWith(
      5,
      'excellent',
      'Great work on state management',
      1
    );
  });

  it('ListPerformanceUseCase should return performance list and certificate flag', async () => {
    const useCase = new ListPerformanceUseCase(mockPerformanceRepo);
    const result = await useCase.execute({ only_with_performance: true });

    expect(result.is_certificate).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.performance).toBe('excellent');
  });

  it('GetStudentModulePerformanceUseCase should return module-wise breakdown for student', async () => {
    const useCase = new GetStudentModulePerformanceUseCase(mockPerformanceRepo);
    const result = await useCase.execute(10);

    expect(result.student.id).toBe(10);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.module_name).toBe('Advanced React');
    expect(result.data[0]?.performance?.performance).toBe('excellent');
  });

  it('CompleteCourseUseCase should set course status to completed', async () => {
    const useCase = new CompleteCourseUseCase(mockProgressRepo);
    const result = await useCase.execute({ student_section_id: 2 });

    expect(result.message).toBe('Course marked as completed successfully');
    expect(mockProgressRepo.completeCourse).toHaveBeenCalledWith(2);
  });
});
