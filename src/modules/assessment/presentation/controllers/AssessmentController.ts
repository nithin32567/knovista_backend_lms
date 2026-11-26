import { ForbiddenError } from '../../../../shared/errors/ForbiddenError';
import { Request, Response, NextFunction } from 'express';
import { SaveAssessmentAnswersUseCase } from '../../application/use-cases/SaveAssessmentAnswersUseCase';
import { GetStudentAssessmentAnswersUseCase } from '../../application/use-cases/GetStudentAssessmentAnswersUseCase';
import { GetTopicAssessmentsUseCase } from '../../application/use-cases/GetTopicAssessmentsUseCase';
import { sendSuccess } from '../../../../shared/utils/response';
import { SaveAssessmentAnswersInput, GetStudentAssessmentAnswersQuery } from '../../application/dto/AssessmentDTO';

export class AssessmentController {
  constructor(
    private readonly saveAssessmentAnswersUseCase: SaveAssessmentAnswersUseCase,
    private readonly getStudentAssessmentAnswersUseCase: GetStudentAssessmentAnswersUseCase,
    private readonly getTopicAssessmentsUseCase: GetTopicAssessmentsUseCase
  ) {}

  async saveAssessmentAnswers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as SaveAssessmentAnswersInput;
      if (!req.user || input.answers.some((answer) => answer.student_id !== req.user?.id) || req.user.type !== 'student') {
        throw new ForbiddenError('Only the student may submit their answers');
      }
      const result = await this.saveAssessmentAnswersUseCase.execute(input);
      const data = result.map((item) => item.toRawResponseObject());

      sendSuccess(res, data, 'Assessment answers saved successfully');
    } catch (err) {
      next(err);
    }
  }

  async getStudentAssessmentAnswers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as GetStudentAssessmentAnswersQuery;
      if (!req.user || (req.user.type === 'student' && query.student_id !== req.user.id) || (req.user.type === 'institution_user' && !['Admin', 'Team Lead'].includes(req.user.role ?? ''))) {
        throw new ForbiddenError('Assessment access denied');
      }
      const result = await this.getStudentAssessmentAnswersUseCase.execute(
        query.student_id,
        query.topic_id
      );
      const data = result.map((item) => item.toResponseObject());

      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  async getTopicAssessments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const topicId = Number(req.params['id']);
      const isStaff = req.user?.type === 'institution_user';
      const result = await this.getTopicAssessmentsUseCase.execute(topicId);
      const data = result.map((item) => item.toResponseObject(isStaff));

      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }
}

