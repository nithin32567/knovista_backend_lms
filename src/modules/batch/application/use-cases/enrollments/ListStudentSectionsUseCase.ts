import { IStudentSectionRepository } from '../../../domain/repositories/IStudentSectionRepository';

export class ListStudentSectionsUseCase {
  constructor(private readonly studentSectionRepository: IStudentSectionRepository) {}

  async execute(batchId?: number | undefined, studentId?: number | undefined, status?: string | undefined) {
    const studentSections = await this.studentSectionRepository.findMany(batchId, studentId, status);
    return studentSections.map((s) => s.toResponseObject());
  }
}

