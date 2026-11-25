import { IProgramRepository } from '../../../domain/repositories/IProgramRepository';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class DeleteProgramUseCase {
  constructor(private readonly programRepository: IProgramRepository) {}

  async execute(id: number, updaterId: number): Promise<void> {
    const success = await this.programRepository.delete(id, updaterId);
    if (!success) {
      throw new NotFoundError('Program not found');
    }
  }
}

