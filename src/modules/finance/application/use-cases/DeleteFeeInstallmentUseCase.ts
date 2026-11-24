import { IFeeCollectionRepository } from '../../domain/repositories/IFeeCollectionRepository';
import { DeleteInstallmentInput } from '../dto/FeeCollectionDTO';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { AppError } from '../../../../shared/errors/AppError';

export class DeleteFeeInstallmentUseCase {
  constructor(private readonly feeCollectionRepository: IFeeCollectionRepository) {}

  async execute(input: DeleteInstallmentInput): Promise<void> {
    const feeId = input.fee_id;
    const feeCollection = await this.feeCollectionRepository.findById(feeId);

    if (!feeCollection) {
      throw new NotFoundError('Fee collection record not found');
    }

    if (!feeCollection.canBeModified()) {
      throw new AppError('Only pending installments can be deleted', 422);
    }

    await this.feeCollectionRepository.deleteInstallment(feeId);
  }
}
