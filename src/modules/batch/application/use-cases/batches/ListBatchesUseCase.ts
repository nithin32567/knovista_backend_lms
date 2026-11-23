import { IBatchRepository } from '../../../domain/repositories/IBatchRepository';

export class ListBatchesUseCase {
  constructor(private readonly batchRepository: IBatchRepository) {}

  async execute(sectionId?: number | undefined, status?: string | undefined) {
    const batches = await this.batchRepository.findMany(sectionId, status);
    return batches.map((b) => b.toResponseObject());
  }
}

