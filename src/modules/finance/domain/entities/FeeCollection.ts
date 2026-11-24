import { FeeCollectionHistory } from './FeeCollectionHistory';

export type FeeStatus = 'pending' | 'collected' | 'partial' | 'cancelled';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export class FeeCollection {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly studentSectionId: string | null,
    public readonly installmentNo: number,
    public readonly feeAmount: number,
    public readonly paidAmount: number,
    public readonly balanceAmount: number,
    public readonly dueDate: Date,
    public readonly feeStatus: FeeStatus,
    public readonly approvalStatus: ApprovalStatus,
    public readonly createdBy: string | null,
    public readonly updatedBy: string | null,
    public readonly collectedBy: string | null,
    public readonly collectedAt: Date | null,
    public readonly authBy: string | null,
    public readonly authAt: Date | null,
    public readonly authRemark: string | null,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
    public readonly histories?: FeeCollectionHistory[],
    public readonly createdUser?: string | null,
    public readonly collectedUser?: string | null,
    public readonly authUser?: string | null,
  ) {}

  isOverdue(): boolean {
    return this.feeStatus === 'pending' && this.dueDate < new Date();
  }

  canBeCollected(): boolean {
    return this.feeStatus !== 'cancelled' && this.approvalStatus !== 'approved';
  }

  canBeModified(): boolean {
    return this.feeStatus === 'pending';
  }

  canBeApproved(): boolean {
    return (
      (this.feeStatus === 'collected' || this.feeStatus === 'partial') &&
      this.approvalStatus === 'pending'
    );
  }
}
