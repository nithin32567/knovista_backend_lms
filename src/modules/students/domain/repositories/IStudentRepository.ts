import { Student } from '../entities/Student';

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

export interface IStudentRepository {
  findMany(filters: StudentFilterParams): Promise<{ students: Student[]; total: number }>;
  findById(id: number): Promise<Student | null>;
  findByEmail(email: string): Promise<Student | null>;
  findByUsername(username: string): Promise<Student | null>;
  findByMobile(mobile: string): Promise<Student | null>;
  create(data: CreateStudentParams): Promise<Student>;
  updatePassword(id: number, passwordHash: string, updatedBy?: number | undefined): Promise<void>;
}
