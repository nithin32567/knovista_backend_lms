import { StudentSection } from '../entities/StudentSection';
import { StudentSectionModule } from '../entities/StudentSectionModule';

export interface CreateStudentSectionData {
  studentId: number;
  batchId: number;
  startDate?: Date | null | undefined;
  endDate?: Date | null | undefined;
  createdBy: number;
  updatedBy: number;
}

export interface UpdateStudentSectionData {
  startDate?: Date | null | undefined;
  endDate?: Date | null | undefined;
  status?: string | undefined;
  progressPercent?: number | undefined;
  updatedBy: number;
}

export interface IStudentSectionRepository {
  findMany(batchId?: number | undefined, studentId?: number | undefined, status?: string | undefined): Promise<StudentSection[]>;
  findById(id: number): Promise<StudentSection | null>;
  findByStudentAndBatch(studentId: number, batchId: number): Promise<StudentSection | null>;
  create(data: CreateStudentSectionData): Promise<StudentSection>;
  update(id: number, data: UpdateStudentSectionData): Promise<StudentSection | null>;
  delete(id: number): Promise<boolean>;
  findModules(studentSectionId: number): Promise<StudentSectionModule[]>;
  findByStudentId(studentId: number): Promise<StudentSection[]>;
}

