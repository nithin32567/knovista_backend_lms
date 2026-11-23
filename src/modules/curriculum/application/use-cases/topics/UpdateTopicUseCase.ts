import { ITopicRepository, UpdateTopicData } from '../../../domain/repositories/ITopicRepository';
import { UpdateTopicInput } from '../../dto/TopicDTO';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class UpdateTopicUseCase {
  constructor(private readonly topicRepository: ITopicRepository) {}

  async execute(id: number, input: UpdateTopicInput, updaterId: number) {
    const updateData: UpdateTopicData = {
      updatedBy: updaterId,
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.type !== undefined) {
      updateData.type = input.type;
    }
    if (input.content_url !== undefined) {
      updateData.contentUrl = input.content_url;
    }
    if (input.order !== undefined) {
      updateData.order = input.order;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }

    const updated = await this.topicRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError('Topic not found');
    }
    return updated.toResponseObject();
  }
}

