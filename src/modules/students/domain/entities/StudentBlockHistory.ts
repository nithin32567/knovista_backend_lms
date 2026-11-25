export interface StudentBlockHistoryProps {
  id: number;
  studentId: number;
  reasonId: number | null;
  reasonName: string | null;
  description: string | null;
  blockedBy: number | null;
  unblockedBy: number | null;
  status: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class StudentBlockHistory {
  constructor(private readonly props: StudentBlockHistoryProps) {}

  get id(): number { return this.props.id; }
  get studentId(): number { return this.props.studentId; }
  get reasonId(): number | null { return this.props.reasonId; }
  get reasonName(): string | null { return this.props.reasonName; }
  get description(): string | null { return this.props.description; }
  get blockedBy(): number | null { return this.props.blockedBy; }
  get unblockedBy(): number | null { return this.props.unblockedBy; }
  get status(): string { return this.props.status; }
  get createdAt(): Date | null { return this.props.createdAt; }

  toResponseObject() {
    return {
      id: this.id,
      student_id: this.studentId,
      reason_id: this.reasonId,
      reason_name: this.reasonName,
      description: this.description,
      blocked_by: this.blockedBy,
      unblocked_by: this.unblockedBy,
      status: this.status,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
    };
  }
}

