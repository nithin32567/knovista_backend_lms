import { IStudentSectionRepository } from '../../../domain/repositories/IStudentSectionRepository';

export class GetStudentMyBatchesUseCase {
  constructor(private readonly studentSectionRepository: IStudentSectionRepository) {}

  async execute(studentId: number) {
    const enrollments = await this.studentSectionRepository.findByStudentId(studentId);
    return enrollments.map((e) => e.toResponseObject());
  }
}

