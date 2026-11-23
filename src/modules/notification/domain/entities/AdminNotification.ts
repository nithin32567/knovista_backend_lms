export interface AdminNotificationProps {
  id: number;
  userId?: number | null | undefined;
  message: string;
  status: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class AdminNotification {
  constructor(private readonly props: AdminNotificationProps) {}

  get id(): number { return this.props.id; }
  get userId(): number | null | undefined { return this.props.userId; }
  get message(): string { return this.props.message; }
  get status(): string { return this.props.status; }
  get createdAt(): Date | null { return this.props.createdAt; }
  get updatedAt(): Date | null { return this.props.updatedAt; }

  toResponseObject() {
    return {
      id: this.id,
      user_id: this.userId ?? null,
      message: this.message,
      status: this.status,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
      updated_at: this.updatedAt ? this.updatedAt.toISOString() : null,
    };
  }
}

