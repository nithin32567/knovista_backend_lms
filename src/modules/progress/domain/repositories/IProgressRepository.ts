import { StudentTopicProgress } from '../entities/StudentTopicProgress';
import { ModuleUnlockRequest } from '../entities/ModuleUnlockRequest';

export interface ListUnlockRequestsFilter {
  studentId?: number | undefined;
  batchId?: number | undefined;
  sectionId?: number | undefined;
  loginStatus?: boolean | undefined;
  keyword?: string | undefined;
  actor?: { id: number; role?: string | undefined } | undefined;
  page: number;
  perPage: number;
}

export interface IProgressRepository {
  findTopicProgressById(id: number): Promise<StudentTopicProgress | null>;
  findTopicProgressByStudentAndTopic(studentId: number, topicId: number): Promise<StudentTopicProgress | null>;
  completeTopic(topicProgressId: number, studentId: number): Promise<StudentTopicProgress | null>;
  getStudentSectionIdByTopicProgress(topicProgressId: number): Promise<number | null>;
  recalculateSectionProgress(studentSectionId: number): Promise<number>;
  requestModuleUnlock(
    studentId: number,
    sectionId: number,
    nextModuleId: number
  ): Promise<{ success: boolean; tutorId: number | null; studentName: string | null; moduleName: string | null }>;
  listUnlockRequests(filters: ListUnlockRequestsFilter): Promise<{ items: ModuleUnlockRequest[]; total: number }>;
  approveModuleUnlock(
    studentId: number,
    studentSectionId: number,
    moduleId: number,
    approverUserId: number,
    sectionId: number,
    role?: string | undefined
  ): Promise<boolean>;
  completeCourse(studentSectionId: number): Promise<boolean>;
}
