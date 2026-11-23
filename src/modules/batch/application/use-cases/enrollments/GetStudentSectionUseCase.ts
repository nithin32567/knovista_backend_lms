import { IStudentSectionRepository } from '../../../domain/repositories/IStudentSectionRepository';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class GetStudentSectionUseCase {
  constructor(private readonly studentSectionRepository: IStudentSectionRepository) {}

  async execute(id: number) {
    const studentSection = await this.studentSectionRepository.findById(id);
    if (!studentSection) {
      throw new NotFoundError('Enrollment record not found');
    }
    return studentSection.toResponseObject();
  }
}

