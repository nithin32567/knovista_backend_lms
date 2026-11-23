import { IProgramExtensionRepository, CreateExtensionData } from '../../../domain/repositories/IProgramExtensionRepository';
import { IStudentSectionRepository } from '../../../domain/repositories/IStudentSectionRepository';
import { CreateExtensionInput } from '../../dto/ProgramExtensionDTO';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class CreateExtensionUseCase {
  constructor(
    private readonly extensionRepository: IProgramExtensionRepository,
    private readonly studentSectionRepository: IStudentSectionRepository
  ) {}

  async execute(input: CreateExtensionInput, requestedBy: number) {
    const studentSection = await this.studentSectionRepository.findById(input.student_section_id);
    if (!studentSection) {
      throw new NotFoundError('Student enrollment not found');
    }

    const data: CreateExtensionData = {
      studentSectionId: input.student_section_id,
      requestedBy,
      reason: input.reason,
      extensionMonths: input.extension_months,
    };

    const extension = await this.extensionRepository.create(data);
    return extension.toResponseObject();
  }
}

