import { IProgramRepository } from '../../../domain/repositories/IProgramRepository';
import { CloneProgramInput } from '../../dto/ProgramDTO';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class CloneProgramUseCase {
  constructor(private readonly programRepository: IProgramRepository) {}

  async execute(input: CloneProgramInput, creatorId: number): Promise<number> {
    const sourceProgram = await this.programRepository.findById(input.program_id);
    if (!sourceProgram) {
      throw new NotFoundError('Program not found');
    }

    return this.programRepository.clone(input.program_id, creatorId);
  }
}

