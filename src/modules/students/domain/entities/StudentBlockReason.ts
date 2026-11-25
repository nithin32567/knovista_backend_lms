export interface StudentBlockReasonProps {
  id: number;
  name: string;
  status: string;
  createdAt: Date | null;
}

export class StudentBlockReason {
  constructor(private readonly props: StudentBlockReasonProps) {}

  get id(): number { return this.props.id; }
  get name(): string { return this.props.name; }
  get status(): string { return this.props.status; }
  get createdAt(): Date | null { return this.props.createdAt; }

  toResponseObject() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
    };
  }
}

