export interface StudentAssessmentAnswerProps {
  id: number;
  studentId: number;
  studentTopicId: number;
  topicId: number;
  topicAssessmentId: number;
  answer: string | null;
  marks: boolean;
  question?: string | null | undefined;
  options?: unknown | undefined;
  correctAnswer?: string | null | undefined;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class StudentAssessmentAnswer {
  constructor(private readonly props: StudentAssessmentAnswerProps) {}

  get id(): number { return this.props.id; }
  get studentId(): number { return this.props.studentId; }
  get studentTopicId(): number { return this.props.studentTopicId; }
  get topicId(): number { return this.props.topicId; }
  get topicAssessmentId(): number { return this.props.topicAssessmentId; }
  get answer(): string | null { return this.props.answer; }
  get marks(): boolean { return this.props.marks; }
  get question(): string | null | undefined { return this.props.question; }
  get options(): unknown | undefined { return this.props.options; }
  get correctAnswer(): string | null | undefined { return this.props.correctAnswer; }
  get createdAt(): Date | null { return this.props.createdAt; }
  get updatedAt(): Date | null { return this.props.updatedAt; }

  toResponseObject() {
    return {
      assessment_id: this.topicAssessmentId,
      question: this.question ?? null,
      options: this.options ?? null,
      answer: this.answer,
      marks: this.marks,
      correct_answer: this.correctAnswer ?? null,
    };
  }

  toRawResponseObject() {
    return {
      id: this.id,
      student_id: this.studentId,
      student_topic_id: this.studentTopicId,
      topic_id: this.topicId,
      topic_assessment_id: this.topicAssessmentId,
      answer: this.answer,
      marks: this.marks,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}

