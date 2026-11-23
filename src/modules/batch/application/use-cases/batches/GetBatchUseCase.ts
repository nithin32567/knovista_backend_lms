import { IBatchRepository } from '../../../domain/repositories/IBatchRepository';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class GetBatchUseCase {
  constructor(private readonly batchRepository: IBatchRepository) {}

  async execute(id: number) {
    const batch = await this.batchRepository.findById(id);
    if (!batch) {
      throw new NotFoundError('Batch not found');
    }
    return batch.toResponseObject();
  }
}

