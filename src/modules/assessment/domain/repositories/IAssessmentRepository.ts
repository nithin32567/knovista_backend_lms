import { TopicAssessment } from '../entities/TopicAssessment';
import { StudentAssessmentAnswer } from '../entities/StudentAssessmentAnswer';

export interface SaveAssessmentAnswerInput {
  studentId: number;
  studentTopicId: number;
  topicId: number;
  assessmentId: number;
  answer: string;
  marks?: boolean | undefined;
}

export interface IAssessmentRepository {
  findAssessmentsByTopicId(topicId: number, studentId?: number): Promise<TopicAssessment[]>;
  findAssessmentById(id: number): Promise<TopicAssessment | null>;
  saveAssessmentAnswers(answers: SaveAssessmentAnswerInput[]): Promise<StudentAssessmentAnswer[]>;
  getStudentAssessmentAnswers(studentId: number, topicId: number): Promise<StudentAssessmentAnswer[]>;
}

