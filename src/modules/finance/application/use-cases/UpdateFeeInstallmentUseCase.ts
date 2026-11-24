import { FeeCollection } from '../../domain/entities/FeeCollection';
import { IFeeCollectionRepository } from '../../domain/repositories/IFeeCollectionRepository';
import { UpdateInstallmentInput } from '../dto/FeeCollectionDTO';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { AppError } from '../../../../shared/errors/AppError';

export class UpdateFeeInstallmentUseCase {
  constructor(private readonly feeCollectionRepository: IFeeCollectionRepository) {}

  async execute(input: UpdateInstallmentInput, authUserId: number): Promise<FeeCollection> {
    const feeId = input.fee_id;
    const feeCollection = await this.feeCollectionRepository.findById(feeId);

    if (!feeCollection) {
      throw new NotFoundError('Fee collection record not found');
    }

    if (!feeCollection.canBeModified()) {
      throw new AppError('Only pending installments can be modified', 422);
    }

    const updatedBy = input.updated_by ?? authUserId;

    const updateData: Parameters<IFeeCollectionRepository['updateInstallment']>[1] = {
      updatedBy,
    };

    if (input.fee_amount !== undefined) {
      updateData.feeAmount = input.fee_amount;
    }

    if (input.due_date !== undefined) {
      updateData.dueDate = new Date(input.due_date);
    }

    return this.feeCollectionRepository.updateInstallment(feeId, updateData);
  }
}
