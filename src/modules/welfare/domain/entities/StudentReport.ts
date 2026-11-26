export interface StudentReportProps {
  id: number;
  studentId: number;
  reportHeadId: number | null;
  description: string | null;
  status: string;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class StudentReport {
  constructor(private readonly props: StudentReportProps) {}

  get id(): number { return this.props.id; }
  get studentId(): number { return this.props.studentId; }
  get reportHeadId(): number | null { return this.props.reportHeadId; }
  get description(): string | null { return this.props.description; }
  get status(): string { return this.props.status; }
  get createdBy(): number | null { return this.props.createdBy; }
  get updatedBy(): number | null { return this.props.updatedBy; }
  get createdAt(): Date | null { return this.props.createdAt; }
  get updatedAt(): Date | null { return this.props.updatedAt; }

  toResponseObject() {
    return {
      id: this.id,
      student_id: this.studentId,
      report_head_id: this.reportHeadId,
      description: this.description,
      status: this.status,
      created_by: this.createdBy,
      updated_by: this.updatedBy,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
      updated_at: this.updatedAt ? this.updatedAt.toISOString() : null,
    };
  }
}

