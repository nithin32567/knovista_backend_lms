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

    const durationInMonths = input.duration_in_months !== undefined && input.duration_in_months !== null
      ? input.duration_in_months
      : (input.duration ? parseInt(input.duration, 10) || null : null);

    const data: CreateSectionData = {
      programId: input.program_id,
      code: input.code ?? null,
      name: input.name,
      description: input.description ?? null,
      icon: input.icon ?? null,
      coverImage: input.cover_image ?? null,
      duration: input.duration ?? (durationInMonths ? String(durationInMonths) : null),
      durationInMonths,
      amount: input.amount ?? 0,
      priority: input.priority ?? 0,
      status: input.status ?? 'Active',
      isDemo: input.is_demo ?? false,
      createdBy: creatorId,
      updatedBy: creatorId,
    };

    const section = await this.sectionRepository.create(data);
    return section.toResponseObject();
  }
}
