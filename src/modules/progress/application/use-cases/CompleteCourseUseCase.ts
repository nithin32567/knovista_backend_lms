import { IProgressRepository } from '../../domain/repositories/IProgressRepository';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { CompleteCourseInput } from '../dto/ProgressDTO';

export class CompleteCourseUseCase {
  constructor(private readonly progressRepository: IProgressRepository) {}

  async execute(input: CompleteCourseInput) {
    const success = await this.progressRepository.completeCourse(input.student_section_id);
    if (!success) {
      throw new NotFoundError('Student section not found');
    }

    return {
      message: 'Course marked as completed successfully',
    };
  }
}
