import { Student } from '../entities/Student';

export interface CreateStudentParams {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  mobileNo: string;
  passwordHash: string;
  gender: string;
}

export interface IStudentRepository {
  findById(id: number): Promise<Student | null>;
  findByIdentifier(identifier: string): Promise<Student | null>;
  findByEmail(email: string): Promise<Student | null>;
  findByUsername(username: string): Promise<Student | null>;
  findByMobile(mobile: string): Promise<Student | null>;
  create(params: CreateStudentParams): Promise<Student>;
  updateLoginStatus(id: number, status: string): Promise<void>;
  updatePassword(id: number, passwordHash: string): Promise<void>;
}

