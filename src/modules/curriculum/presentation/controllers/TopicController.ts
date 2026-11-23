import { Request, Response, NextFunction } from 'express';
import { ListTopicsUseCase } from '../../application/use-cases/topics/ListTopicsUseCase';
import { CreateTopicUseCase } from '../../application/use-cases/topics/CreateTopicUseCase';
import { GetTopicUseCase } from '../../application/use-cases/topics/GetTopicUseCase';
import { UpdateTopicUseCase } from '../../application/use-cases/topics/UpdateTopicUseCase';
import { TopicQuerySchema, CreateTopicInput, UpdateTopicInput } from '../../application/dto/TopicDTO';
import { sendSuccess } from '../../../../shared/utils/response';

export class TopicController {
  constructor(
    private readonly listTopicsUseCase: ListTopicsUseCase,
    private readonly createTopicUseCase: CreateTopicUseCase,
    private readonly getTopicUseCase: GetTopicUseCase,
    private readonly updateTopicUseCase: UpdateTopicUseCase
  ) {}

  index = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = TopicQuerySchema.parse(req.query);
      const topics = await this.listTopicsUseCase.execute(query.module_id, query.type, query.status);
      sendSuccess(res, topics, 'Topics retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  store = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as CreateTopicInput;
      const creatorId = req.user?.id ?? 1;
      const topic = await this.createTopicUseCase.execute(input, creatorId);
      sendSuccess(res, topic, 'Topic created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  show = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] ?? '0', 10);
      const topic = await this.getTopicUseCase.execute(id);
      sendSuccess(res, topic, 'Topic retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] ?? '0', 10);
      const input = req.body as UpdateTopicInput;
      const updaterId = req.user?.id ?? 1;
      const topic = await this.updateTopicUseCase.execute(id, input, updaterId);
      sendSuccess(res, topic, 'Topic updated successfully');
    } catch (error) {
      next(error);
    }
  };
}

