import { ISpecialCategoryRepository, CreateSpecialCategoryData } from '../../../domain/repositories/ISpecialCategoryRepository';
import { CreateSpecialCategoryInput } from '../../dto/SpecialCategoryDTO';

export class CreateSpecialCategoryUseCase {
  constructor(private readonly specialCategoryRepository: ISpecialCategoryRepository) {}

  async execute(input: CreateSpecialCategoryInput, creatorId: number) {
    const data: CreateSpecialCategoryData = {
      name: input.name,
      description: input.description ?? null,
      createdBy: creatorId,
      updatedBy: creatorId,
    };

    const category = await this.specialCategoryRepository.create(data);
    return category.toResponseObject();
  }
}

