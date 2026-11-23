import { IModuleRepository, CreateModuleData } from '../../../domain/repositories/IModuleRepository';
import { ISectionRepository } from '../../../domain/repositories/ISectionRepository';
import { CreateModuleInput } from '../../dto/ModuleDTO';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class CreateModuleUseCase {
  constructor(
    private readonly moduleRepository: IModuleRepository,
    private readonly sectionRepository: ISectionRepository
  ) {}

  async execute(input: CreateModuleInput, creatorId: number) {
    const section = await this.sectionRepository.findById(input.section_id);
    if (!section) {
      throw new NotFoundError('Selected section does not exist');
    }

    const data: CreateModuleData = {
      sectionId: input.section_id,
      name: input.name,
      description: input.description ?? null,
      order: input.order ?? 0,
      createdBy: creatorId,
      updatedBy: creatorId,
    };

    const courseModule = await this.moduleRepository.create(data);
    return courseModule.toResponseObject();
  }
}

