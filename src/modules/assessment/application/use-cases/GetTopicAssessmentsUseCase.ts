import { IAssessmentRepository } from '../../domain/repositories/IAssessmentRepository';
import { TopicAssessment } from '../../domain/entities/TopicAssessment';

export class GetTopicAssessmentsUseCase {
  constructor(private readonly assessmentRepository: IAssessmentRepository) {}

  async execute(topicId: number, studentId?: number): Promise<TopicAssessment[]> {
    if (studentId === undefined) return this.assessmentRepository.findAssessmentsByTopicId(topicId);
    return this.assessmentRepository.findAssessmentsByTopicId(topicId, studentId);
  }
}

