import { FeeCollection } from '../../domain/entities/FeeCollection';
import { IFeeCollectionRepository } from '../../domain/repositories/IFeeCollectionRepository';
import { CancelFeeInput } from '../dto/FeeCollectionDTO';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { AppError } from '../../../../shared/errors/AppError';

export class CancelFeeUseCase {
  constructor(private readonly feeCollectionRepository: IFeeCollectionRepository) {}

  async execute(input: CancelFeeInput, authUserId: number): Promise<FeeCollection> {
    const feeId = input.fee_id;
    const feeCollection = await this.feeCollectionRepository.findById(feeId);

    if (!feeCollection) {
      throw new NotFoundError('Fee collection record not found');
    }

    if (!feeCollection.canBeModified()) {
      throw new AppError('Only pending installments can be cancelled', 422);
    }

    const updatedBy = input.updated_by ?? authUserId;

    return this.feeCollectionRepository.cancelFee(feeId, updatedBy);
  }
}
