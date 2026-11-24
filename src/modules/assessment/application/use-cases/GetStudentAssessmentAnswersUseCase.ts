import { IAssessmentRepository } from '../../domain/repositories/IAssessmentRepository';
import { StudentAssessmentAnswer } from '../../domain/entities/StudentAssessmentAnswer';

export class GetStudentAssessmentAnswersUseCase {
  constructor(private readonly assessmentRepository: IAssessmentRepository) {}

  async execute(studentId: number, topicId: number): Promise<StudentAssessmentAnswer[]> {
    return this.assessmentRepository.getStudentAssessmentAnswers(studentId, topicId);
  }
}

