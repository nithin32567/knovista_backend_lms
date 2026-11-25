export interface StudentNotificationProps {
  id: number;
  studentId: number;
  title: string | null;
  message: string | null;
  status: string;
  type: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class StudentNotification {
  constructor(private readonly props: StudentNotificationProps) {}

  get id(): number { return this.props.id; }
  get studentId(): number { return this.props.studentId; }
  get title(): string | null { return this.props.title; }
  get message(): string | null { return this.props.message; }
  get status(): string { return this.props.status; }
  get type(): string | null { return this.props.type; }
  get createdAt(): Date | null { return this.props.createdAt; }
  get updatedAt(): Date | null { return this.props.updatedAt; }

  toResponseObject() {
    return {
      id: this.id,
      student_id: this.studentId,
      title: this.title,
      message: this.message,
      status: this.status,
      type: this.type,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
      updated_at: this.updatedAt ? this.updatedAt.toISOString() : null,
    };
  }
}

