import { ITopicRepository, CreateTopicData } from '../../../domain/repositories/ITopicRepository';
import { IModuleRepository } from '../../../domain/repositories/IModuleRepository';
import { CreateTopicInput } from '../../dto/TopicDTO';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class CreateTopicUseCase {
  constructor(
    private readonly topicRepository: ITopicRepository,
    private readonly moduleRepository: IModuleRepository
  ) {}

  async execute(input: CreateTopicInput, creatorId: number) {
    const courseModule = await this.moduleRepository.findById(input.module_id);
    if (!courseModule) {
      throw new NotFoundError('Selected module does not exist');
    }

    const data: CreateTopicData = {
      moduleId: input.module_id,
      name: input.name,
      description: input.description ?? null,
      type: input.type,
      contentUrl: input.content_url ?? null,
      order: input.order ?? 0,
      createdBy: creatorId,
      updatedBy: creatorId,
    };

    const topic = await this.topicRepository.create(data);
    return topic.toResponseObject();
  }
}

