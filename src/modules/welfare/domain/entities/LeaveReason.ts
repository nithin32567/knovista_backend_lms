export interface LeaveReasonProps {
  id: number;
  name: string;
  status: string;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class LeaveReason {
  constructor(private readonly props: LeaveReasonProps) {}

  get id(): number { return this.props.id; }
  get name(): string { return this.props.name; }
  get status(): string { return this.props.status; }
  get createdBy(): number | null { return this.props.createdBy; }
  get updatedBy(): number | null { return this.props.updatedBy; }
  get createdAt(): Date | null { return this.props.createdAt; }
  get updatedAt(): Date | null { return this.props.updatedAt; }

  toResponseObject() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      created_by: this.createdBy,
      updated_by: this.updatedBy,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
      updated_at: this.updatedAt ? this.updatedAt.toISOString() : null,
    };
  }
}

