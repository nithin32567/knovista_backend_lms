import { IStudentLeaveRepository } from '../../../domain/repositories/IStudentLeaveRepository';
import { IStudentNotificationWriter } from '../../../../notification/infrastructure/persistence/PrismaStudentNotificationRepository';
import { AuthorizeLeaveInput } from '../../dto/StudentLeaveDTO';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';
import { AppError } from '../../../../../shared/errors/AppError';
import { env } from '../../../../../config/env';

export class AuthorizeLeaveUseCase {
  constructor(
    private readonly leaveRepository: IStudentLeaveRepository,
    private readonly studentNotificationWriter: IStudentNotificationWriter,
  ) {}

  async execute(leaveId: number, input: AuthorizeLeaveInput, authorizedBy: number) {
    const leave = await this.leaveRepository.findById(leaveId);

    if (!leave || leave.status === 'deleted') {
      throw new NotFoundError('Leave request not found');
    }

    if (!leave.isPending()) {
      throw new AppError('Only pending leave requests can be authorized', 400);
    }

    const remark = input.authorization_remark ?? null;
    const updated = await this.leaveRepository.authorize(leaveId, {
      status: input.status,
      authorizationRemark: remark,
      authorizedBy,
      updatedBy: authorizedBy,
    });

    const startStr = updated.startDate.toISOString().split('T')[0] ?? '';
    const endStr = updated.endDate.toISOString().split('T')[0] ?? '';
    const title =
      input.status === 'approved' ? 'Leave Request Approved' : 'Leave Request Rejected';
    const baseMessage = `Your leave request from ${startStr} to ${endStr} has been ${input.status}.`;
    const message = remark ? `${baseMessage} Remark: ${remark}` : baseMessage;

    await this.studentNotificationWriter.create({
      studentId: updated.studentId,
      title,
      message,
      type: 'leave',
    });

    const proofUrl = updated.proof
      ? `${env.APP_URL}/api/student-leaves/${updated.id}/proof`
      : null;

    return updated.toResponseObject(proofUrl);
  }
}
