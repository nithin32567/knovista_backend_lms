import { StudentReport } from '../entities/StudentReport';
import { StudentReportHead } from '../entities/StudentReportHead';

export interface CreateReportData {
  studentId: number;
  reportHeadId: number;
  description: string | null;
  createdBy: number | null;
  updatedBy: number | null;
}

export interface ListReportsFilters {
  studentId?: number | undefined;
  reportHeadId?: number | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  role?: string | undefined;
}

export interface IStudentReportRepository {
  create(data: CreateReportData): Promise<StudentReport>;
  findById(id: number): Promise<StudentReport | null>;
  softDelete(id: number, updatedBy: number | null): Promise<void>;
  findAll(filters: ListReportsFilters): Promise<StudentReport[]>;
  findByStudentIds(studentIds: number[], filters: ListReportsFilters): Promise<StudentReport[]>;
  findActiveHeads(): Promise<StudentReportHead[]>;
}
