import { IStudentSectionRepository, CreateStudentSectionData } from '../../../domain/repositories/IStudentSectionRepository';
import { IBatchRepository } from '../../../domain/repositories/IBatchRepository';
import { CreateStudentSectionInput } from '../../dto/StudentSectionDTO';
import { ValidationError } from '../../../../../shared/errors/ValidationError';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class CreateStudentSectionUseCase {
  constructor(
    private readonly studentSectionRepository: IStudentSectionRepository,
    private readonly batchRepository: IBatchRepository
  ) {}

  async execute(input: CreateStudentSectionInput, creatorId: number) {
    const batch = await this.batchRepository.findById(input.batch_id);
    if (!batch) {
      throw new NotFoundError('Selected batch does not exist');
    }

    const existing = await this.studentSectionRepository.findByStudentAndBatch(input.student_id, input.batch_id);
    if (existing) {
      throw new ValidationError('Student is already enrolled in this batch', {
        student_id: ['Student already assigned to this batch.'],
      });
    }

    const data: CreateStudentSectionData = {
      studentId: input.student_id,
      batchId: input.batch_id,
      startDate: input.start_date ? new Date(input.start_date) : null,
      endDate: input.end_date ? new Date(input.end_date) : null,
      createdBy: creatorId,
      updatedBy: creatorId,
    };

    const studentSection = await this.studentSectionRepository.create(data);
    return studentSection.toResponseObject();
  }
}

