import { IStudentSectionRepository, UpdateStudentSectionData } from '../../../domain/repositories/IStudentSectionRepository';
import { UpdateStudentSectionInput } from '../../dto/StudentSectionDTO';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class UpdateStudentSectionUseCase {
  constructor(private readonly studentSectionRepository: IStudentSectionRepository) {}

  async execute(id: number, input: UpdateStudentSectionInput, updaterId: number) {
    const updateData: UpdateStudentSectionData = {
      updatedBy: updaterId,
    };

    if (input.start_date !== undefined) {
      updateData.startDate = input.start_date ? new Date(input.start_date) : null;
    }
    if (input.end_date !== undefined) {
      updateData.endDate = input.end_date ? new Date(input.end_date) : null;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    if (input.progress_percent !== undefined) {
      updateData.progressPercent = input.progress_percent;
    }

    const updated = await this.studentSectionRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError('Enrollment record not found');
    }
    return updated.toResponseObject();
  }
}

