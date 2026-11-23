import { ISpecialCategoryRepository, UpdateSpecialCategoryData } from '../../../domain/repositories/ISpecialCategoryRepository';
import { UpdateSpecialCategoryInput } from '../../dto/SpecialCategoryDTO';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class UpdateSpecialCategoryUseCase {
  constructor(private readonly specialCategoryRepository: ISpecialCategoryRepository) {}

  async execute(id: number, input: UpdateSpecialCategoryInput, updaterId: number) {
    const updateData: UpdateSpecialCategoryData = {
      updatedBy: updaterId,
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }

    const updated = await this.specialCategoryRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError('Special category not found');
    }
    return updated.toResponseObject();
  }
}

