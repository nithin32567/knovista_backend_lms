export interface ProgramExtensionProps {
  id: number;
  studentSectionId: number;
  requestedBy: number;
  reason: string;
  extensionMonths: number;
  status: string;
  reviewedBy?: number | null | undefined;
  reviewedAt?: Date | null | undefined;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class ProgramExtension {
  constructor(private readonly props: ProgramExtensionProps) {}

  get id(): number { return this.props.id; }
  get studentSectionId(): number { return this.props.studentSectionId; }
  get requestedBy(): number { return this.props.requestedBy; }
  get reason(): string { return this.props.reason; }
  get extensionMonths(): number { return this.props.extensionMonths; }
  get status(): string { return this.props.status; }
  get reviewedBy(): number | null | undefined { return this.props.reviewedBy; }
  get reviewedAt(): Date | null | undefined { return this.props.reviewedAt; }
  get createdAt(): Date | null { return this.props.createdAt; }
  get updatedAt(): Date | null { return this.props.updatedAt; }

  toResponseObject() {
    return {
      id: this.id,
      student_section_id: this.studentSectionId,
      requested_by: this.requestedBy,
      reason: this.reason,
      extension_months: this.extensionMonths,
      status: this.status,
      reviewed_by: this.reviewedBy ?? null,
      reviewed_at: this.reviewedAt ? this.reviewedAt.toISOString() : null,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
      updated_at: this.updatedAt ? this.updatedAt.toISOString() : null,
    };
  }
}

