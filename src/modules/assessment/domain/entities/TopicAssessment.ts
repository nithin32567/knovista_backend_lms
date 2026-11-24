export interface TopicAssessmentProps {
  id: number;
  topicId: number;
  question: string;
  options: unknown;
  answer?: unknown | undefined;
  correctAnswer?: string | null | undefined;
  marks: number;
  priority?: number | null | undefined;
  status: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class TopicAssessment {
  constructor(private readonly props: TopicAssessmentProps) {}

  get id(): number { return this.props.id; }
  get topicId(): number { return this.props.topicId; }
  get question(): string { return this.props.question; }
  get options(): unknown { return this.props.options; }
  get answer(): unknown | undefined { return this.props.answer; }
  get correctAnswer(): string | null | undefined { return this.props.correctAnswer; }
  get marks(): number { return this.props.marks; }
  get priority(): number | null | undefined { return this.props.priority; }
  get status(): string { return this.props.status; }
  get createdAt(): Date | null { return this.props.createdAt; }
  get updatedAt(): Date | null { return this.props.updatedAt; }

  toResponseObject(includeAnswer = false) {
    const res: Record<string, unknown> = {
      id: this.id,
      topic_id: this.topicId,
      question: this.question,
      options: this.options,
      priority: this.priority ?? 1,
      status: this.status,
    };

    if (includeAnswer) {
      res['answer'] = this.answer ?? this.correctAnswer ?? null;
      res['correct_answer'] = this.correctAnswer ?? this.answer ?? null;
      res['marks'] = this.marks;
    }

    return res;
  }
}

