import { IProgramRepository } from '../../../domain/repositories/IProgramRepository';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class GetProgramUseCase {
  constructor(private readonly programRepository: IProgramRepository) {}

  async execute(id: number) {
    const program = await this.programRepository.findById(id);
    if (!program) {
      throw new NotFoundError('Program not found');
    }
    return program.toResponseObject();
  }
}

