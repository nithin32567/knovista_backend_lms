import { IModuleRepository } from '../../../domain/repositories/IModuleRepository';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class GetModuleUseCase {
  constructor(private readonly moduleRepository: IModuleRepository) {}

  async execute(id: number) {
    const courseModule = await this.moduleRepository.findById(id);
    if (!courseModule) {
      throw new NotFoundError('Module not found');
    }
    return courseModule.toResponseObject();
  }
}

