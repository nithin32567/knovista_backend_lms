import { InstitutionRole } from '../entities/InstitutionRole';

export interface IInstitutionRoleRepository {
  findActiveRoles(): Promise<InstitutionRole[]>;
  findById(id: number): Promise<InstitutionRole | null>;
  findByName(name: string): Promise<InstitutionRole | null>;
}

