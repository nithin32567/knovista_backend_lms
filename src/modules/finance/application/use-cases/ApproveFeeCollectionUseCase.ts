import { FeeCollection } from '../../domain/entities/FeeCollection';
import { IFeeCollectionRepository } from '../../domain/repositories/IFeeCollectionRepository';
import { ApproveFeeInput } from '../dto/FeeCollectionDTO';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { AppError } from '../../../../shared/errors/AppError';

export class ApproveFeeCollectionUseCase {
  constructor(private readonly feeCollectionRepository: IFeeCollectionRepository) {}

  async execute(input: ApproveFeeInput, authUserId: number): Promise<FeeCollection> {
    const feeId = input.fee_id;
    const feeCollection = await this.feeCollectionRepository.findById(feeId);

    if (!feeCollection) {
      throw new NotFoundError('Fee collection record not found');
    }

    if (!feeCollection.canBeApproved()) {
      if (feeCollection.approvalStatus !== 'pending') {
        throw new AppError('This installment has already been processed', 422);
      }
      throw new AppError(
        'Only collected or partial installments can be approved or rejected',
        422,
      );
    }

    const authById = authUserId;

    return this.feeCollectionRepository.approveFee(feeId, {
      approvalStatus: input.approval_status,
      authById,
      authAt: new Date(),
      authRemark: input.auth_remark,
    });
  }
}
