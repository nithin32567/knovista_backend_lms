import { FeeCollection } from '../../domain/entities/FeeCollection';
import { IFeeCollectionRepository } from '../../domain/repositories/IFeeCollectionRepository';
import { CollectFeeInput } from '../dto/FeeCollectionDTO';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { AppError } from '../../../../shared/errors/AppError';

export class CollectFeeUseCase {
  constructor(private readonly feeCollectionRepository: IFeeCollectionRepository) {}

  async execute(input: CollectFeeInput, authUserId: number): Promise<FeeCollection> {
    const feeId = input.fee_id;
    const feeCollection = await this.feeCollectionRepository.findById(feeId);

    if (!feeCollection) {
      throw new NotFoundError('Fee collection record not found');
    }

    if (!feeCollection.canBeCollected()) {
      if (feeCollection.feeStatus === 'cancelled') {
        throw new AppError('Cannot collect a cancelled fee installment', 422);
      }
      throw new AppError('This installment has already been approved', 422);
    }

    const collectedById = authUserId;

    return this.feeCollectionRepository.collectFee(feeId, {
      paidAmount: input.paid_amount,
      collectedById,
      collectedAt: new Date(),
    });
  }
}
