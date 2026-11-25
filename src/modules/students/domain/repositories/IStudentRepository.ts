import { Student } from '../entities/Student';
import { StudentBlockReason } from '../entities/StudentBlockReason';

export interface StudentFilterParams {
  page: number;
  perPage: number;
  keyword?: string | undefined;
  status?: string | undefined;
  location?: string | undefined;
  loginStatus?: string | undefined;
  creatorId?: number | undefined;
}

export interface CreateStudentParams {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth?: Date | null | undefined;
  mobileNo: string;
  alternateMobileNo?: string | null | undefined;
  parentMobileNo?: string | null | undefined;
  parentName?: string | null | undefined;
  address?: string | null | undefined;
  location?: string | null | undefined;
  pincode?: string | null | undefined;
  state?: string | null | undefined;
  email: string;
  username: string;
  passwordHash: string;
  qualification?: string | null | undefined;
  specialCategoryId?: number | null | undefined;
  salesPersonName?: string | null | undefined;
  salesPersonPhone?: string | null | undefined;
  paidAmount?: number | undefined;
  createdBy: number;
  updatedBy: number;
}

export interface UpdateStudentParams {
  firstName?: string | undefined;
  lastName?: string | undefined;
  gender?: string | undefined;
  dateOfBirth?: Date | null | undefined;
  mobileNo?: string | undefined;
  alternateMobileNo?: string | null | undefined;
  parentMobileNo?: string | null | undefined;
  parentName?: string | null | undefined;
  address?: string | null | undefined;
  location?: string | null | undefined;
  pincode?: string | null | undefined;
  state?: string | null | undefined;
  email?: string | undefined;
  qualification?: string | null | undefined;
  specialCategoryId?: number | null | undefined;
  salesPersonName?: string | null | undefined;
  salesPersonPhone?: string | null | undefined;
  paidAmount?: number | undefined;
  updatedBy: number;
}

export interface BlockStudentParams {
  studentId: number;
  reasonId: number;
  description?: string | undefined;
  blockedBy: number;
}

export interface DropStudentParams {
  studentId: number;
  reason?: string | undefined;
  droppedBy: number;
}

export interface IStudentRepository {
  findMany(filters: StudentFilterParams): Promise<{ students: Student[]; total: number }>;
  findById(id: number): Promise<Student | null>;
  findByEmail(email: string): Promise<Student | null>;
  findByUsername(username: string): Promise<Student | null>;
  findByMobile(mobile: string): Promise<Student | null>;
  create(data: CreateStudentParams): Promise<Student>;
  update(id: number, data: UpdateStudentParams): Promise<Student>;
  updatePassword(id: number, passwordHash: string, updatedBy?: number | undefined): Promise<void>;
  updateProfilePic(id: number, profilePicPath: string, updatedBy: number): Promise<void>;
  updateStatus(id: number, status: string, updatedBy: number): Promise<void>;
  updateLoginStatus(id: number, loginStatus: string): Promise<void>;
  blockStudent(params: BlockStudentParams): Promise<void>;
  unblockStudent(studentId: number, unblockedBy: number): Promise<void>;
  dropStudent(params: DropStudentParams): Promise<void>;
  undropStudent(studentId: number, updatedBy: number): Promise<void>;
  unblockModules(studentId: number, studentSectionId: number): Promise<void>;
  softDelete(id: number, deletedBy: number): Promise<void>;
  findBlockReasons(): Promise<StudentBlockReason[]>;
}

