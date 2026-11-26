import { StudentLeave } from '../entities/StudentLeave';

export interface CreateLeaveData {
  studentId: number;
  startDate: string;
  endDate: string;
  noOfDays: number | null;
  reasonId: number;
  description: string | null;
  proofPath: string | null;
  createdBy: number | null;
}

export interface AuthorizeLeaveData {
  status: 'approved' | 'rejected';
  authorizationRemark: string | null;
  authorizedBy: number;
  updatedBy: number;
}

export interface ListLeavesFilters {
  studentId?: number | undefined;
  reasonId?: number | undefined;
  status?: string | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
}

export interface IStudentLeaveRepository {
  create(data: CreateLeaveData): Promise<StudentLeave>;
  findById(id: number): Promise<StudentLeave | null>;
  authorize(id: number, data: AuthorizeLeaveData): Promise<StudentLeave>;
  findAll(filters: ListLeavesFilters): Promise<StudentLeave[]>;
  findByStudentIds(studentIds: number[], filters: ListLeavesFilters): Promise<StudentLeave[]>;
  findByStudentId(studentId: number, filters: ListLeavesFilters): Promise<StudentLeave[]>;
}

