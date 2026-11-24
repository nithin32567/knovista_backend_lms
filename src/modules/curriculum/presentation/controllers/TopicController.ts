import { Request, Response, NextFunction } from 'express';
import { ListTopicsUseCase } from '../../application/use-cases/topics/ListTopicsUseCase';
import { CreateTopicUseCase } from '../../application/use-cases/topics/CreateTopicUseCase';
import { GetTopicUseCase } from '../../application/use-cases/topics/GetTopicUseCase';
import { UpdateTopicUseCase } from '../../application/use-cases/topics/UpdateTopicUseCase';
import { TopicQuerySchema, CreateTopicInput, UpdateTopicInput } from '../../application/dto/TopicDTO';
import { AssessmentData } from '../../domain/repositories/ITopicRepository';
import { sendSuccess } from '../../../../shared/utils/response';

function parseAssessmentsFromBody(body: Record<string, unknown>): AssessmentData[] {
  if (Array.isArray(body['assessments'])) {
    return body['assessments'] as AssessmentData[];
  }
  if (typeof body['assessments'] === 'object' && body['assessments'] !== null) {
    return Object.values(body['assessments'] as Record<string, AssessmentData>);
  }

  const assessmentsMap: Record<number, Partial<AssessmentData> & { optionsObj?: Record<string, string>; answerObj?: Record<string, string> }> = {};

  for (const [key, value] of Object.entries(body)) {
    const match = key.match(/^assessments\[(\d+)\]\[([^\]]+)\](?:\[([^\]]+)\])?$/);
    if (!match) continue;

    const index = parseInt(match[1] ?? '0', 10);
    const field = match[2];
    const subfield = match[3];

    if (!assessmentsMap[index]) {
      assessmentsMap[index] = {};
    }

    const item = assessmentsMap[index]!;
    if (field === 'question' && typeof value === 'string') {
      item.question = value;
    } else if (field === 'priority') {
      item.priority = typeof value === 'number' ? value : parseInt(String(value), 10) || 1;
    } else if (field === 'status' && typeof value === 'string') {
      item.status = value;
    } else if (field === 'options') {
      if (!item.optionsObj) item.optionsObj = {};
      if (subfield && typeof value === 'string') {
        item.optionsObj[subfield] = value;
      }
    } else if (field === 'answer') {
      if (!item.answerObj) item.answerObj = {};
      if (subfield && typeof value === 'string') {
        item.answerObj[subfield] = value;
      }
    }
  }

  const result: AssessmentData[] = [];
  for (const item of Object.values(assessmentsMap)) {
    if (item.question) {
      result.push({
        question: item.question,
        options: item.optionsObj ?? {},
        answer: item.answerObj ?? {},
        correctAnswer: item.answerObj?.['Ans1'] ?? null,
        priority: item.priority ?? 1,
        status: item.status ?? 'Active',
      });
    }
  }

  return result;
}

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
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const coverImageFile = files?.['cover_image']?.[0];
      const uploadFile = files?.['file_upload']?.[0] ?? files?.['file']?.[0];

      const coverImage = coverImageFile ? `/storage/topics/${coverImageFile.filename}` : input.cover_image;
      const fileUrl = uploadFile ? `/storage/topics/${uploadFile.filename}` : (input.file_url ?? input.content_url);

      const assessments = parseAssessmentsFromBody(req.body as Record<string, unknown>);

      const topic = await this.createTopicUseCase.execute(
        {
          ...input,
          cover_image: coverImage,
          file_url: fileUrl,
          content_url: fileUrl,
        },
        creatorId,
        assessments.length > 0 ? assessments : undefined
      );
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
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const coverImageFile = files?.['cover_image']?.[0];
      const uploadFile = files?.['file_upload']?.[0] ?? files?.['file']?.[0];

      const coverImage = coverImageFile ? `/storage/topics/${coverImageFile.filename}` : input.cover_image;
      const fileUrl = uploadFile ? `/storage/topics/${uploadFile.filename}` : (input.file_url ?? input.content_url);

      const assessments = parseAssessmentsFromBody(req.body as Record<string, unknown>);

      const topic = await this.updateTopicUseCase.execute(
        id,
        {
          ...input,
          ...(coverImage !== undefined ? { cover_image: coverImage } : {}),
          ...(fileUrl !== undefined ? { file_url: fileUrl, content_url: fileUrl } : {}),
        },
        updaterId,
        assessments.length > 0 ? assessments : undefined
      );
      sendSuccess(res, topic, 'Topic updated successfully');
    } catch (error) {
      next(error);
    }
  };
}
