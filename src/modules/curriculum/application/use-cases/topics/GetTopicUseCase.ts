import { ITopicRepository } from '../../../domain/repositories/ITopicRepository';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class GetTopicUseCase {
  constructor(private readonly topicRepository: ITopicRepository) {}

  async execute(id: number) {
    const topic = await this.topicRepository.findById(id);
    if (!topic) {
      throw new NotFoundError('Topic not found');
    }
    return topic.toResponseObject();
  }
}

