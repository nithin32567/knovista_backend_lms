export interface StudentLeaveProps {
  id: number;
  studentId: number;
  startDate: Date;
  endDate: Date;
  noOfDays: number | null;
  reasonId: number | null;
  description: string | null;
  proof: string | null;
  status: string;
  authorizedBy: number | null;
  authorizationRemark: string | null;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class StudentLeave {
  constructor(private readonly props: StudentLeaveProps) {}

  get id(): number { return this.props.id; }
  get studentId(): number { return this.props.studentId; }
  get startDate(): Date { return this.props.startDate; }
  get endDate(): Date { return this.props.endDate; }
  get noOfDays(): number | null { return this.props.noOfDays; }
  get reasonId(): number | null { return this.props.reasonId; }
  get description(): string | null { return this.props.description; }
  get proof(): string | null { return this.props.proof; }
  get status(): string { return this.props.status; }
  get authorizedBy(): number | null { return this.props.authorizedBy; }
  get authorizationRemark(): string | null { return this.props.authorizationRemark; }
  get createdBy(): number | null { return this.props.createdBy; }
  get updatedBy(): number | null { return this.props.updatedBy; }
  get createdAt(): Date | null { return this.props.createdAt; }
  get updatedAt(): Date | null { return this.props.updatedAt; }

  isPending(): boolean {
    return this.props.status === 'pending';
  }

  toResponseObject(proofUrl: string | null = null) {
    return {
      id: this.id,
      student_id: this.studentId,
      start_date: this.startDate.toISOString().split('T')[0] ?? null,
      end_date: this.endDate.toISOString().split('T')[0] ?? null,
      no_of_days: this.noOfDays,
      reason_id: this.reasonId,
      description: this.description,
      proof: proofUrl,
      status: this.status,
      authorized_by: this.authorizedBy,
      authorization_remark: this.authorizationRemark,
      created_by: this.createdBy,
      updated_by: this.updatedBy,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
      updated_at: this.updatedAt ? this.updatedAt.toISOString() : null,
    };
  }
}

