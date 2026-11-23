import { IInstitutionRoleRepository } from '../../domain/repositories/IInstitutionRoleRepository';

export class GetActiveRolesUseCase {
  constructor(private readonly institutionRoleRepository: IInstitutionRoleRepository) {}

  async execute() {
    const roles = await this.institutionRoleRepository.findActiveRoles();
    return roles.map((r) => r.toResponseObject());
  }
}

