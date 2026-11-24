import { ITopicRepository, CreateTopicData, AssessmentData } from '../../../domain/repositories/ITopicRepository';
import { IModuleRepository } from '../../../domain/repositories/IModuleRepository';
import { CreateTopicInput } from '../../dto/TopicDTO';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class CreateTopicUseCase {
  constructor(
    private readonly topicRepository: ITopicRepository,
    private readonly moduleRepository: IModuleRepository
  ) {}

  async execute(input: CreateTopicInput, creatorId: number, assessments?: AssessmentData[]) {
    const courseModule = await this.moduleRepository.findById(input.module_id);
    if (!courseModule) {
      throw new NotFoundError('Selected module does not exist');
    }

    const fileUrl = input.file_url ?? input.content_url ?? null;
    const priority = input.priority ?? input.order ?? 0;

    const data: CreateTopicData = {
      moduleId: input.module_id,
      name: input.name,
      description: input.description ?? null,
      type: input.type,
      coverImage: input.cover_image ?? null,
      fileUrl,
      contentUrl: fileUrl,
      dayCount: input.day_count ?? 1,
      priority,
      order: priority,
      status: input.status ?? 'Active',
      createdBy: creatorId,
      updatedBy: creatorId,
      assessments,
    };

    const topic = await this.topicRepository.create(data);
    return topic.toResponseObject();
  }
}
