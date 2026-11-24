import { FeeCollection } from '../../domain/entities/FeeCollection';
import { IFeeCollectionRepository } from '../../domain/repositories/IFeeCollectionRepository';
import { CreateFeeScheduleInput } from '../dto/FeeCollectionDTO';
import { AppError } from '../../../../shared/errors/AppError';

export class CreateFeeScheduleUseCase {
  constructor(private readonly feeCollectionRepository: IFeeCollectionRepository) {}

  async execute(input: CreateFeeScheduleInput, createdById: number): Promise<FeeCollection[]> {
    const installmentNumbers = input.installments.map((i) => i.installment_no);
    const uniqueNumbers = new Set(installmentNumbers);

    if (installmentNumbers.length !== uniqueNumbers.size) {
      throw new AppError('Duplicate installment numbers are not allowed', 422);
    }

    const creatorId = input.created_by ?? createdById;

    const installmentsData = input.installments.map((inst) => ({
      studentId: input.student_id,
      studentSectionId: input.student_section_id ?? null,
      installmentNo: inst.installment_no,
      feeAmount: inst.fee_amount,
      dueDate: new Date(inst.due_date),
      createdBy: creatorId,
    }));

    return this.feeCollectionRepository.createMany(installmentsData);
  }
}
