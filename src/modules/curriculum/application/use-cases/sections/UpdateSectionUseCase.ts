import { ISectionRepository, UpdateSectionData } from '../../../domain/repositories/ISectionRepository';
import { UpdateSectionInput } from '../../dto/SectionDTO';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class UpdateSectionUseCase {
  constructor(private readonly sectionRepository: ISectionRepository) {}

  async execute(id: number, input: UpdateSectionInput, updaterId: number) {
    const durationInMonths = input.duration_in_months !== undefined && input.duration_in_months !== null
      ? input.duration_in_months
      : (input.duration ? parseInt(input.duration, 10) || null : undefined);

    const updateData: UpdateSectionData = {
      updatedBy: updaterId,
    };

    if (input.program_id !== undefined) {
      updateData.programId = input.program_id;
    }
    if (input.code !== undefined) {
      updateData.code = input.code;
    }
    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.icon !== undefined) {
      updateData.icon = input.icon;
    }
    if (input.cover_image !== undefined) {
      updateData.coverImage = input.cover_image;
    }
    if (input.duration !== undefined) {
      updateData.duration = input.duration;
    }
    if (durationInMonths !== undefined) {
      updateData.durationInMonths = durationInMonths;
    }
    if (input.amount !== undefined) {
      updateData.amount = input.amount;
    }
    if (input.priority !== undefined) {
      updateData.priority = input.priority;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    if (input.is_demo !== undefined) {
      updateData.isDemo = input.is_demo;
    }

    const updated = await this.sectionRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError('Section not found');
    }
    return updated.toResponseObject();
  }
}
