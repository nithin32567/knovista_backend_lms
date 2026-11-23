export interface StudentSectionProps {
  id: number;
  studentId: number;
  batchId: number;
  startDate?: Date | null | undefined;
  endDate?: Date | null | undefined;
  status: string;
  progressPercent: number;
  createdBy: number;
  updatedBy: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  studentName?: string | undefined;
  batchName?: string | undefined;
}

export class StudentSection {
  constructor(private readonly props: StudentSectionProps) {}

  get id(): number { return this.props.id; }
  get studentId(): number { return this.props.studentId; }
  get batchId(): number { return this.props.batchId; }
  get startDate(): Date | null | undefined { return this.props.startDate; }
  get endDate(): Date | null | undefined { return this.props.endDate; }
  get status(): string { return this.props.status; }
  get progressPercent(): number { return this.props.progressPercent; }
  get createdBy(): number { return this.props.createdBy; }
  get updatedBy(): number { return this.props.updatedBy; }
  get createdAt(): Date | null { return this.props.createdAt; }
  get updatedAt(): Date | null { return this.props.updatedAt; }
  get studentName(): string | undefined { return this.props.studentName; }
  get batchName(): string | undefined { return this.props.batchName; }

  toResponseObject() {
    return {
      id: this.id,
      student_id: this.studentId,
      batch_id: this.batchId,
      start_date: this.startDate ? this.startDate.toISOString().split('T')[0] : null,
      end_date: this.endDate ? this.endDate.toISOString().split('T')[0] : null,
      status: this.status,
      progress_percent: this.progressPercent,
      created_by: this.createdBy,
      updated_by: this.updatedBy,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
      updated_at: this.updatedAt ? this.updatedAt.toISOString() : null,
      student_name: this.studentName ?? null,
      batch_name: this.batchName ?? null,
    };
  }
}

