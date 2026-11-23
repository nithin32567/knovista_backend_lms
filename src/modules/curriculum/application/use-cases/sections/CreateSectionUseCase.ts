import { ISectionRepository, CreateSectionData } from '../../../domain/repositories/ISectionRepository';
import { IProgramRepository } from '../../../domain/repositories/IProgramRepository';
import { CreateSectionInput } from '../../dto/SectionDTO';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class CreateSectionUseCase {
  constructor(
    private readonly sectionRepository: ISectionRepository,
    private readonly programRepository: IProgramRepository
  ) {}

  async execute(input: CreateSectionInput, creatorId: number) {
    const program = await this.programRepository.findById(input.program_id);
    if (!program) {
      throw new NotFoundError('Selected program does not exist');
    }

    const data: CreateSectionData = {
      programId: input.program_id,
      name: input.name,
      description: input.description ?? null,
      durationInMonths: input.duration_in_months ?? null,
      createdBy: creatorId,
      updatedBy: creatorId,
    };

    const section = await this.sectionRepository.create(data);
    return section.toResponseObject();
  }
}

