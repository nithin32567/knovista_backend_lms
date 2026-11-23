import { IProgramRepository, CreateProgramData } from '../../../domain/repositories/IProgramRepository';
import { CreateProgramInput } from '../../dto/ProgramDTO';

export class CreateProgramUseCase {
  constructor(private readonly programRepository: IProgramRepository) {}

  async execute(input: CreateProgramInput, creatorId: number) {
    const data: CreateProgramData = {
      name: input.name,
      description: input.description ?? null,
      createdBy: creatorId,
      updatedBy: creatorId,
    };
    const program = await this.programRepository.create(data);
    return program.toResponseObject();
  }
}

