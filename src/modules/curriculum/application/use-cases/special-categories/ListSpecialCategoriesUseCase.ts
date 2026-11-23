import { ISpecialCategoryRepository } from '../../../domain/repositories/ISpecialCategoryRepository';

export class ListSpecialCategoriesUseCase {
  constructor(private readonly specialCategoryRepository: ISpecialCategoryRepository) {}

  async execute(status?: string | undefined) {
    const categories = await this.specialCategoryRepository.findMany(status);
    return categories.map((c) => c.toResponseObject());
  }
}

