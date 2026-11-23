import { IInstitutionUserRepository } from '../../domain/repositories/IInstitutionUserRepository';
import { ListInstitutionUsersQueryInput } from '../dto/InstitutionUserDTO';

export class ListInstitutionUsersUseCase {
  constructor(private readonly institutionUserRepository: IInstitutionUserRepository) {}

  async execute(input: ListInstitutionUsersQueryInput) {
    const users = await this.institutionUserRepository.findMany({
      roleId: input.role_id,
      status: input.status,
    });

    return users.map((u) => u.toResponseObject());
  }
}

