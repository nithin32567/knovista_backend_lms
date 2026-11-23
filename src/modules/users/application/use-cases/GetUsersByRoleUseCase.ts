import { IInstitutionUserRepository } from '../../domain/repositories/IInstitutionUserRepository';

export class GetUsersByRoleUseCase {
  constructor(private readonly institutionUserRepository: IInstitutionUserRepository) {}

  async execute(roleName: string) {
    const users = await this.institutionUserRepository.findByRoleName(roleName);
    return users.map((u) => u.toResponseObject());
  }
}

