import { IStudentSectionRepository } from '../../../domain/repositories/IStudentSectionRepository';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class GetStudentBatchModulesUseCase {
  constructor(private readonly studentSectionRepository: IStudentSectionRepository) {}

  async execute(studentId: number, batchId: number) {
    const studentSection = await this.studentSectionRepository.findByStudentAndBatch(studentId, batchId);
    if (!studentSection) {
      throw new NotFoundError('You are not enrolled in this batch');
    }

    const modules = await this.studentSectionRepository.findModules(studentSection.id);
    return modules.map((m) => m.toResponseObject());
  }
}

