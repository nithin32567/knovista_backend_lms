import { IProgramExtensionRepository, UpdateExtensionData } from '../../../domain/repositories/IProgramExtensionRepository';
import { IStudentSectionRepository, UpdateStudentSectionData } from '../../../domain/repositories/IStudentSectionRepository';
import { UpdateExtensionInput } from '../../dto/ProgramExtensionDTO';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class UpdateExtensionUseCase {
  constructor(
    private readonly extensionRepository: IProgramExtensionRepository,
    private readonly studentSectionRepository: IStudentSectionRepository
  ) {}

  async execute(id: number, input: UpdateExtensionInput, reviewerId: number) {
    const existing = await this.extensionRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Extension request not found');
    }

    const updateData: UpdateExtensionData = {
      status: input.status,
      reviewedBy: reviewerId,
    };

    const updated = await this.extensionRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError('Extension request not found');
    }

    if (input.status === 'Approved') {
      const studentSection = await this.studentSectionRepository.findById(existing.studentSectionId);
      if (studentSection && studentSection.endDate) {
        const newEndDate = new Date(studentSection.endDate);
        newEndDate.setMonth(newEndDate.getMonth() + existing.extensionMonths);
        const sectionUpdate: UpdateStudentSectionData = {
          endDate: newEndDate,
          updatedBy: reviewerId,
        };
        await this.studentSectionRepository.update(studentSection.id, sectionUpdate);
      }
    }

    return updated.toResponseObject();
  }
}

