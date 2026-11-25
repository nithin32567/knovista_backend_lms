import { ILeaveReasonRepository } from '../../domain/repositories/ILeaveReasonRepository';

export class GetLeaveReasonsUseCase {
  constructor(private readonly leaveReasonRepository: ILeaveReasonRepository) {}

  async execute() {
    const reasons = await this.leaveReasonRepository.findActiveReasons();
    return reasons.map((reason) => reason.toResponseObject());
  }
}

