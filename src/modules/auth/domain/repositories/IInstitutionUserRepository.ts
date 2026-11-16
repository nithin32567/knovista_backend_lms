import { InstitutionUser } from '../entities/InstitutionUser';

export interface IInstitutionUserRepository {
  findById(id: number): Promise<InstitutionUser | null>;
  findByIdentifier(identifier: string): Promise<InstitutionUser | null>;
  updateLastLogin(id: number): Promise<void>;
}

