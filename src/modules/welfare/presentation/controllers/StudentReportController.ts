import { Request, Response, NextFunction } from 'express';
import { CreateStudentReportUseCase } from '../../application/use-cases/reports/CreateStudentReportUseCase';
import { ListStudentReportsUseCase } from '../../application/use-cases/reports/ListStudentReportsUseCase';
import { GetReportHeadsUseCase } from '../../application/use-cases/reports/GetReportHeadsUseCase';
import { DeleteStudentReportUseCase } from '../../application/use-cases/reports/DeleteStudentReportUseCase';
import {
  createStudentReportSchema,
  listStudentReportsQuerySchema,
} from '../../application/dto/StudentReportDTO';
import { positiveIdParamSchema } from '../../application/dto/StudentLeaveDTO';
import { sendSuccess } from '../../../../shared/utils/response';
import { UnauthorizedError } from '../../../../shared/errors/UnauthorizedError';

export class StudentReportController {
  constructor(
    private readonly createStudentReportUseCase: CreateStudentReportUseCase,
    private readonly listStudentReportsUseCase: ListStudentReportsUseCase,
    private readonly getReportHeadsUseCase: GetReportHeadsUseCase,
    private readonly deleteStudentReportUseCase: DeleteStudentReportUseCase,
  ) {}

  createReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        next(new UnauthorizedError('Authentication required'));
        return;
      }

      const parsed = createStudentReportSchema.safeParse(req.body);
      if (!parsed.success) {
        next(parsed.error);
        return;
      }

      const result = await this.createStudentReportUseCase.execute(parsed.data, req.user.id);
      sendSuccess(res, result, 'Student report created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  listReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        next(new UnauthorizedError('Authentication required'));
        return;
      }

      const parsed = listStudentReportsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        next(parsed.error);
        return;
      }

      const reports = await this.listStudentReportsUseCase.execute(req.user, {
        studentId: parsed.data.student_id,
        reportHeadId: parsed.data.report_head_id,
        dateFrom: parsed.data.date_from,
        dateTo: parsed.data.date_to,
        role: parsed.data.role,
      });

      sendSuccess(res, reports, 'Student reports retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getReportHeads = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const heads = await this.getReportHeadsUseCase.execute();
      sendSuccess(res, heads, 'Report heads retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        next(new UnauthorizedError('Authentication required'));
        return;
      }

      const paramsParsed = positiveIdParamSchema.safeParse(req.params);
      if (!paramsParsed.success) {
        next(paramsParsed.error);
        return;
      }

      await this.deleteStudentReportUseCase.execute(paramsParsed.data.id, req.user.id);
      sendSuccess(res, undefined, 'Report deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
