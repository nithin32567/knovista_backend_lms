import { Router } from 'express';
import { AssessmentController } from '../controllers/AssessmentController';
import { PrismaAssessmentRepository } from '../../infrastructure/persistence/PrismaAssessmentRepository';
import { SaveAssessmentAnswersUseCase } from '../../application/use-cases/SaveAssessmentAnswersUseCase';
import { GetStudentAssessmentAnswersUseCase } from '../../application/use-cases/GetStudentAssessmentAnswersUseCase';
import { GetTopicAssessmentsUseCase } from '../../application/use-cases/GetTopicAssessmentsUseCase';
import { authenticate } from '../../../../shared/middleware/authenticate';
import { validateRequest, validateQuery, validateParams } from '../../../../shared/middleware/validateRequest';
import { SaveAssessmentAnswersSchema, GetStudentAssessmentAnswersQuerySchema, TopicIdParamSchema } from '../../application/dto/AssessmentDTO';

export function createAssessmentRouter(): Router {
  const router = Router();

  const repository = new PrismaAssessmentRepository();
  const saveAnswersUseCase = new SaveAssessmentAnswersUseCase(repository);
  const getAnswersUseCase = new GetStudentAssessmentAnswersUseCase(repository);
  const getAssessmentsUseCase = new GetTopicAssessmentsUseCase(repository);
  const controller = new AssessmentController(saveAnswersUseCase, getAnswersUseCase, getAssessmentsUseCase);

  router.post(
    '/student-sections/assessment-answers',
    authenticate('any'),
    validateRequest(SaveAssessmentAnswersSchema),
    (req, res, next) => controller.saveAssessmentAnswers(req, res, next)
  );

  router.get(
    '/student/assessment-answers',
    authenticate('any'),
    validateQuery(GetStudentAssessmentAnswersQuerySchema),
    (req, res, next) => controller.getStudentAssessmentAnswers(req, res, next)
  );

  router.get(
    '/topics/:id/assessments',
    authenticate('any'),
    validateParams(TopicIdParamSchema),
    (req, res, next) => controller.getTopicAssessments(req, res, next)
  );

  return router;
}

