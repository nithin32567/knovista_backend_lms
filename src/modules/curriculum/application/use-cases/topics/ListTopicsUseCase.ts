import { ITopicRepository } from '../../../domain/repositories/ITopicRepository';

export class ListTopicsUseCase {
  constructor(private readonly topicRepository: ITopicRepository) {}

  async execute(moduleId?: number | undefined, type?: string | undefined, status?: string | undefined) {
    const topics = await this.topicRepository.findMany(moduleId, type, status);
    return topics.map((t) => t.toResponseObject());
  }
}

