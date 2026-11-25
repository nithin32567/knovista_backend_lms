import { LeaveReason } from '../entities/LeaveReason';

export interface ILeaveReasonRepository {
  findActiveReasons(): Promise<LeaveReason[]>;
}

