import { ITopicRepository, UpdateTopicData, AssessmentData } from '../../../domain/repositories/ITopicRepository';
import { UpdateTopicInput } from '../../dto/TopicDTO';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class UpdateTopicUseCase {
  constructor(private readonly topicRepository: ITopicRepository) {}

  async execute(id: number, input: UpdateTopicInput, updaterId: number, assessments?: AssessmentData[]) {
    const updateData: UpdateTopicData = {
      updatedBy: updaterId,
    };

    if (input.module_id !== undefined && input.module_id !== null) {
      updateData.moduleId = input.module_id;
    }
    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.type !== undefined) {
      updateData.type = input.type;
    }
    if (input.cover_image !== undefined) {
      updateData.coverImage = input.cover_image;
    }
    if (input.file_url !== undefined) {
      updateData.fileUrl = input.file_url;
      updateData.contentUrl = input.file_url;
    } else if (input.content_url !== undefined) {
      updateData.fileUrl = input.content_url;
      updateData.contentUrl = input.content_url;
    }
    if (input.day_count !== undefined) {
      updateData.dayCount = input.day_count;
    }
    if (input.priority !== undefined) {
      updateData.priority = input.priority;
      if (input.priority !== null) {
        updateData.order = input.priority;
      }
    } else if (input.order !== undefined) {
      updateData.priority = input.order;
      if (input.order !== null) {
        updateData.order = input.order;
      }
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    if (assessments !== undefined) {
      updateData.assessments = assessments;
    }

    const updated = await this.topicRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError('Topic not found');
    }
    return updated.toResponseObject();
  }
}
