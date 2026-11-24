export class FeeCollectionHistory {
  constructor(
    public readonly id: string,
    public readonly feeCollectionId: string,
    public readonly paidAmount: number,
    public readonly collectedBy: string | null,
    public readonly collectedAt: Date | null,
    public readonly recordStatus: string,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
  ) {}
}

