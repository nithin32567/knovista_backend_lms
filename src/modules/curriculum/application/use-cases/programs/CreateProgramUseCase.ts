import { IProgramRepository, CreateProgramData } from '../../../domain/repositories/IProgramRepository';
import { CreateProgramInput } from '../../dto/ProgramDTO';

export interface CreateProgramFiles {
  icon?: string | null | undefined;
  coverImage?: string | null | undefined;
}

export class CreateProgramUseCase {
  constructor(private readonly programRepository: IProgramRepository) {}

  async execute(input: CreateProgramInput, creatorId: number, files?: CreateProgramFiles) {
    const data: CreateProgramData = {
      code: input.code ?? null,
      name: input.name,
      description: input.description ?? null,
      language: input.language ?? 'English',
      icon: files?.icon ?? null,
      coverImage: files?.coverImage ?? null,
      status: input.status ?? 'Active',
      createdBy: input.created_by ?? creatorId,
      updatedBy: input.updated_by ?? creatorId,
    };
    const program = await this.programRepository.create(data);
    return program.toResponseObject();
  }
}
