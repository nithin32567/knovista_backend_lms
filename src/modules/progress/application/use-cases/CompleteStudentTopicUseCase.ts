import { IProgressRepository } from '../../domain/repositories/IProgressRepository';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { CompleteStudentTopicInput } from '../dto/ProgressDTO';

export class CompleteStudentTopicUseCase {
  constructor(private readonly progressRepository: IProgressRepository) {}

  async execute(input: CompleteStudentTopicInput, studentId: number) {
    const existing = await this.progressRepository.findTopicProgressById(input.student_topic_id);
    if (!existing) {
      throw new NotFoundError('Student topic not found');
    }

    const completed = await this.progressRepository.completeTopic(input.student_topic_id, studentId);
    if (!completed) {
      throw new NotFoundError('Failed to mark topic as completed');
    }

    const sectionId = await this.progressRepository.getStudentSectionIdByTopicProgress(input.student_topic_id);
    if (sectionId) {
      await this.progressRepository.recalculateSectionProgress(sectionId);
    }

    return completed.toResponseObject();
  }
}
