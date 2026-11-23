import { IProgressRepository } from '../../domain/repositories/IProgressRepository';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { ApproveModuleUnlockInput } from '../dto/ProgressDTO';

export class ApproveModuleUnlockUseCase {
  constructor(private readonly progressRepository: IProgressRepository) {}

  async execute(input: ApproveModuleUnlockInput, approverUserId: number) {
    const success = await this.progressRepository.approveModuleUnlock(
      input.student_id,
      input.student_section_id,
      input.module_id,
      approverUserId
    );

    if (!success) {
      throw new NotFoundError('Student section module record not found');
    }

    return {
      message: 'Module unlock approved and activated successfully',
    };
  }
}
