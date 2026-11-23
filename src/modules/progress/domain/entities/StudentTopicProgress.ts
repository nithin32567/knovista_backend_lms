export interface StudentTopicProgressProps {
  id: number;
  studentId: number;
  studentSectionModuleId: number;
  topicId: number;
  status: string;
  createdBy?: number | null | undefined;
  createdAt: Date | null;
  topicStartedBy?: number | null | undefined;
  topicStartedAt?: Date | null | undefined;
  topicLastAccessedAt?: Date | null | undefined;
  topicCompletedAt?: Date | null | undefined;
  topicName?: string | undefined;
  topicType?: string | undefined;
}

export class StudentTopicProgress {
  constructor(private readonly props: StudentTopicProgressProps) {}

  get id(): number { return this.props.id; }
  get studentId(): number { return this.props.studentId; }
  get studentSectionModuleId(): number { return this.props.studentSectionModuleId; }
  get topicId(): number { return this.props.topicId; }
  get status(): string { return this.props.status; }
  get createdBy(): number | null | undefined { return this.props.createdBy; }
  get createdAt(): Date | null { return this.props.createdAt; }
  get topicStartedBy(): number | null | undefined { return this.props.topicStartedBy; }
  get topicStartedAt(): Date | null | undefined { return this.props.topicStartedAt; }
  get topicLastAccessedAt(): Date | null | undefined { return this.props.topicLastAccessedAt; }
  get topicCompletedAt(): Date | null | undefined { return this.props.topicCompletedAt; }
  get topicName(): string | undefined { return this.props.topicName; }
  get topicType(): string | undefined { return this.props.topicType; }

  toResponseObject() {
    return {
      id: this.id,
      student_id: this.studentId,
      student_section_module_id: this.studentSectionModuleId,
      topic_id: this.topicId,
      status: this.status,
      created_by: this.createdBy ?? null,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
      topic_started_by: this.topicStartedBy ?? null,
      topic_started_at: this.topicStartedAt ? this.topicStartedAt.toISOString() : null,
      topic_last_accessed_at: this.topicLastAccessedAt ? this.topicLastAccessedAt.toISOString() : null,
      topic_completed_at: this.topicCompletedAt ? this.topicCompletedAt.toISOString() : null,
      topic_name: this.topicName ?? null,
      topic_type: this.topicType ?? null,
    };
  }
}

