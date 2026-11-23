import { ISpecialCategoryRepository } from '../../../domain/repositories/ISpecialCategoryRepository';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class GetSpecialCategoryUseCase {
  constructor(private readonly specialCategoryRepository: ISpecialCategoryRepository) {}

  async execute(id: number) {
    const category = await this.specialCategoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Special category not found');
    }
    return category.toResponseObject();
  }
}

