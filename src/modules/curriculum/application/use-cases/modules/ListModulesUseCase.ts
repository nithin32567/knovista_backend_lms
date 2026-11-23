import { IModuleRepository } from '../../../domain/repositories/IModuleRepository';

export class ListModulesUseCase {
  constructor(private readonly moduleRepository: IModuleRepository) {}

  async execute(sectionId?: number | undefined, status?: string | undefined) {
    const modules = await this.moduleRepository.findMany(sectionId, status);
    return modules.map((m) => m.toResponseObject());
  }
}

