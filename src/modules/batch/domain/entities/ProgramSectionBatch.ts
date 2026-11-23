export interface ProgramSectionBatchProps {
  id: number;
  sectionId: number;
  batchName: string;
  tutorId?: number | null | undefined;
  qaId?: number | null | undefined;
  placementOfficerId?: number | null | undefined;
  startDate?: Date | null | undefined;
  endDate?: Date | null | undefined;
  status: string;
  createdBy: number;
  updatedBy: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class ProgramSectionBatch {
  constructor(private readonly props: ProgramSectionBatchProps) {}

  get id(): number { return this.props.id; }
  get sectionId(): number { return this.props.sectionId; }
  get batchName(): string { return this.props.batchName; }
  get tutorId(): number | null | undefined { return this.props.tutorId; }
  get qaId(): number | null | undefined { return this.props.qaId; }
  get placementOfficerId(): number | null | undefined { return this.props.placementOfficerId; }
  get startDate(): Date | null | undefined { return this.props.startDate; }
  get endDate(): Date | null | undefined { return this.props.endDate; }
  get status(): string { return this.props.status; }
  get createdBy(): number { return this.props.createdBy; }
  get updatedBy(): number { return this.props.updatedBy; }
  get createdAt(): Date | null { return this.props.createdAt; }
  get updatedAt(): Date | null { return this.props.updatedAt; }

  toResponseObject() {
    return {
      id: this.id,
      section_id: this.sectionId,
      batch_name: this.batchName,
      tutor_id: this.tutorId ?? null,
      qa_id: this.qaId ?? null,
      placement_officer_id: this.placementOfficerId ?? null,
      start_date: this.startDate ? this.startDate.toISOString().split('T')[0] : null,
      end_date: this.endDate ? this.endDate.toISOString().split('T')[0] : null,
      status: this.status,
      created_by: this.createdBy,
      updated_by: this.updatedBy,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
      updated_at: this.updatedAt ? this.updatedAt.toISOString() : null,
    };
  }
}

