import { IProgressRepository } from '../../domain/repositories/IProgressRepository';
import { IAdminNotificationRepository } from '../../../notification/domain/repositories/IAdminNotificationRepository';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { RequestUnlockNextModuleInput } from '../dto/ProgressDTO';

export class RequestModuleUnlockUseCase {
  constructor(
    private readonly progressRepository: IProgressRepository,
    private readonly notificationRepository?: IAdminNotificationRepository
  ) {}

  async execute(input: RequestUnlockNextModuleInput) {
    const result = await this.progressRepository.requestModuleUnlock(
      input.student_id,
      input.section_id,
      input.next_module_id
    );

    if (!result.success) {
      throw new NotFoundError('Student section or module record not found');
    }

    if (result.tutorId && this.notificationRepository) {
      const studentName = result.studentName ?? 'A student';
      const moduleName = result.moduleName ?? 'Next Module';
      await this.notificationRepository.create({
        userId: result.tutorId,
        message: `${studentName} has requested to unlock the module "${moduleName}".`,
      });
    }

    return {
      message: 'Unlock request for next module submitted successfully',
    };
  }
}
