import { FeeCollection } from '../../domain/entities/FeeCollection';
import { IFeeCollectionRepository } from '../../domain/repositories/IFeeCollectionRepository';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';

export class GetFeeCollectionUseCase {
  constructor(private readonly feeCollectionRepository: IFeeCollectionRepository) {}

  async execute(id: number): Promise<FeeCollection> {
    const feeCollection = await this.feeCollectionRepository.findById(id);

    if (!feeCollection) {
      throw new NotFoundError('Fee collection record not found');
    }

    return feeCollection;
  }
}

