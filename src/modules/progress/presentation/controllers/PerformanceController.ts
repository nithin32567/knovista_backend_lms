import { Request, Response, NextFunction } from 'express';
import { RecordPerformanceUseCase } from '../../application/use-cases/RecordPerformanceUseCase';
import { ListPerformanceUseCase } from '../../application/use-cases/ListPerformanceUseCase';
import { GetStudentModulePerformanceUseCase } from '../../application/use-cases/GetStudentModulePerformanceUseCase';
import { IPerformanceRepository } from '../../domain/repositories/IPerformanceRepository';
import {
  SavePerformanceInput,
  ListPerformanceQueryInput,
} from '../../application/dto/ProgressDTO';
import { sendSuccess } from '../../../../shared/utils/response';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';

export class PerformanceController {
  constructor(
    private readonly recordPerformanceUseCase: RecordPerformanceUseCase,
    private readonly listPerformanceUseCase: ListPerformanceUseCase,
    private readonly getStudentModulePerformanceUseCase: GetStudentModulePerformanceUseCase,
    private readonly performanceRepository: IPerformanceRepository
  ) {}

  index = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ListPerformanceQueryInput;
      const result = await this.listPerformanceUseCase.execute(query);
      res.status(200).json({
        success: true,
        is_certificate: result.is_certificate,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  };

  store = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as SavePerformanceInput;
      const userId = req.user?.id ? Number(req.user.id) : 0;
      const result = await this.recordPerformanceUseCase.execute(input, userId);
      sendSuccess(res, result, 'Performance saved');
    } catch (error) {
      next(error);
    }
  };

  show = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params['id']);
      const result = await this.performanceRepository.getPerformanceById(id);
      if (!result) {
        throw new NotFoundError('Record not found');
      }
      sendSuccess(res, result.toResponseObject());
    } catch (error) {
      next(error);
    }
  };

  destroy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params['id']);
      const success = await this.performanceRepository.clearPerformance(id);
      if (!success) {
        throw new NotFoundError('Record not found');
      }
      sendSuccess(res, null, 'Performance cleared');
    } catch (error) {
      next(error);
    }
  };

  modulePerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = Number(req.params['student_id']);
      const result = await this.getStudentModulePerformanceUseCase.execute(studentId);
      res.status(200).json({
        success: true,
        student: result.student,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  };

  completedModules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = Number(req.query['student_id']);
      const studentSectionId = req.query['student_section_id'] ? Number(req.query['student_section_id']) : undefined;
      const result = await this.performanceRepository.getCompletedModules(studentId, studentSectionId);
      sendSuccess(res, result, 'Completed modules retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
