import { IBatchRepository, CreateBatchData } from '../../../domain/repositories/IBatchRepository';
import { CreateBatchInput } from '../../dto/BatchDTO';

export class CreateBatchUseCase {
  constructor(private readonly batchRepository: IBatchRepository) {}

  async execute(input: CreateBatchInput, creatorId: number) {
    const data: CreateBatchData = {
      sectionId: input.section_id,
      batchName: input.batch_name,
      tutorId: input.tutor_id ?? null,
      qaId: input.qa_id ?? null,
      placementOfficerId: input.placement_officer_id ?? null,
      startDate: input.start_date ? new Date(input.start_date) : null,
      endDate: input.end_date ? new Date(input.end_date) : null,
      createdBy: creatorId,
      updatedBy: creatorId,
    };

    const batch = await this.batchRepository.create(data);
    return batch.toResponseObject();
  }
}

