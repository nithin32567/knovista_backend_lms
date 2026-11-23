import { IStudentSectionRepository } from '../../../domain/repositories/IStudentSectionRepository';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class DeleteStudentSectionUseCase {
  constructor(private readonly studentSectionRepository: IStudentSectionRepository) {}

  async execute(id: number): Promise<{ message: string }> {
    const deleted = await this.studentSectionRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Enrollment record not found');
    }
    return { message: 'Enrollment removed successfully' };
  }
}

