import { InstitutionUser } from '../entities/InstitutionUser';

export interface CreateInstitutionUserData {
  roleId: number;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth?: Date | null | undefined;
  mobileNo?: string | null | undefined;
  address?: string | null | undefined;
  location?: string | null | undefined;
  pincode?: string | null | undefined;
  state?: string | null | undefined;
  qualification?: string | null | undefined;
  email: string;
  username: string;
  passwordHash: string;
  profilePic?: string | null | undefined;
  createdBy: number;
  updatedBy: number;
}

export interface InstitutionUserFilterParams {
  roleId?: number | undefined;
  status?: string | undefined;
}

export interface IInstitutionUserRepository {
  findMany(filters?: InstitutionUserFilterParams): Promise<InstitutionUser[]>;
  findByRoleName(roleName: string): Promise<InstitutionUser[]>;
  findById(id: number): Promise<InstitutionUser | null>;
  findByEmail(email: string): Promise<InstitutionUser | null>;
  findByUsername(username: string): Promise<InstitutionUser | null>;
  create(data: CreateInstitutionUserData): Promise<InstitutionUser>;
}
