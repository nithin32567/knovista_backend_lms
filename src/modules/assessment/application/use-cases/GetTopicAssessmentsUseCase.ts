import { IAssessmentRepository } from '../../domain/repositories/IAssessmentRepository';
import { TopicAssessment } from '../../domain/entities/TopicAssessment';

export class GetTopicAssessmentsUseCase {
  constructor(private readonly assessmentRepository: IAssessmentRepository) {}

  async execute(topicId: number): Promise<TopicAssessment[]> {
    return this.assessmentRepository.findAssessmentsByTopicId(topicId);
  }
}

