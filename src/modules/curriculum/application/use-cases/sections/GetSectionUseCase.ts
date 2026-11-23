import { ISectionRepository } from '../../../domain/repositories/ISectionRepository';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class GetSectionUseCase {
  constructor(private readonly sectionRepository: ISectionRepository) {}

  async execute(id: number) {
    const section = await this.sectionRepository.findById(id);
    if (!section) {
      throw new NotFoundError('Section not found');
    }
    return section.toResponseObject();
  }
}

