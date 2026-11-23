import { ISectionRepository, UpdateSectionData } from '../../../domain/repositories/ISectionRepository';
import { UpdateSectionInput } from '../../dto/SectionDTO';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class UpdateSectionUseCase {
  constructor(private readonly sectionRepository: ISectionRepository) {}

  async execute(id: number, input: UpdateSectionInput, updaterId: number) {
    const updateData: UpdateSectionData = {
      updatedBy: updaterId,
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.duration_in_months !== undefined) {
      updateData.durationInMonths = input.duration_in_months;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }

    const updated = await this.sectionRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError('Section not found');
    }
    return updated.toResponseObject();
  }
}

