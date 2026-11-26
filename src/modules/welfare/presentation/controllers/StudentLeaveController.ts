import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { CreateLeaveUseCase } from '../../application/use-cases/leaves/CreateLeaveUseCase';
import { ListLeavesUseCase } from '../../application/use-cases/leaves/ListLeavesUseCase';
import { AuthorizeLeaveUseCase } from '../../application/use-cases/leaves/AuthorizeLeaveUseCase';
import { GetLeaveProofUseCase } from '../../application/use-cases/leaves/GetLeaveProofUseCase';
import { GetLeaveReasonsUseCase } from '../../application/use-cases/GetLeaveReasonsUseCase';
import {
  createLeaveSchema,
  authorizeLeaveSchema,
  listLeavesQuerySchema,
  positiveIdParamSchema,
} from '../../application/dto/StudentLeaveDTO';
import { getRelativeProofPath } from '../../infrastructure/upload/leaveUploadMiddleware';
import { sendSuccess } from '../../../../shared/utils/response';
import { UnauthorizedError } from '../../../../shared/errors/UnauthorizedError';
import { ForbiddenError } from '../../../../shared/errors/ForbiddenError';

function cleanupUploadedFile(file: Express.Multer.File | undefined): void {
  if (file?.path && fs.existsSync(file.path)) {
    fs.unlink(file.path, () => undefined);
  }
}

export class StudentLeaveController {
  constructor(
    private readonly createLeaveUseCase: CreateLeaveUseCase,
    private readonly listLeavesUseCase: ListLeavesUseCase,
    private readonly authorizeLeaveUseCase: AuthorizeLeaveUseCase,
    private readonly getLeaveProofUseCase: GetLeaveProofUseCase,
    private readonly getLeaveReasonsUseCase: GetLeaveReasonsUseCase,
  ) {}

  getLeaveReasons = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reasons = await this.getLeaveReasonsUseCase.execute();
      sendSuccess(res, reasons, 'Leave reasons retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  createLeave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || req.user.type !== 'student') {
        cleanupUploadedFile(req.file);
        next(new UnauthorizedError('Student authentication required'));
        return;
      }

      const parsed = createLeaveSchema.safeParse(req.body);
      if (!parsed.success) {
        cleanupUploadedFile(req.file);
        next(parsed.error);
        return;
      }

      if (parsed.data.student_id !== undefined && parsed.data.student_id !== req.user.id) {
        cleanupUploadedFile(req.file);
        next(new ForbiddenError('Cannot create leave request for another student'));
        return;
      }

      const proofPath = req.file ? getRelativeProofPath(req.file) : null;
      const result = await this.createLeaveUseCase.execute(
        {
          ...parsed.data,
          student_id: parsed.data.student_id ?? req.user.id,
        },
        proofPath,
        null,
      );

      sendSuccess(res, result, 'Leave request created', 201);
    } catch (error) {
      cleanupUploadedFile(req.file);
      next(error);
    }
  };

  listLeaves = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        next(new UnauthorizedError('Authentication required'));
        return;
      }

      const parsed = listLeavesQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        next(parsed.error);
        return;
      }

      const leaves = await this.listLeavesUseCase.execute(req.user, {
        studentId: parsed.data.student_id,
        reasonId: parsed.data.reason_id,
        status: parsed.data.status,
        dateFrom: parsed.data.date_from,
        dateTo: parsed.data.date_to,
      });

      sendSuccess(res, leaves, 'Leaves retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  authorizeLeave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const parsed = authorizeLeaveSchema.safeParse(req.body);
      if (!parsed.success) {
        next(parsed.error);
        return;
      }

      const result = await this.authorizeLeaveUseCase.execute(
        paramsParsed.data.id,
        parsed.data,
        req.user.id,
      );

      sendSuccess(res, result, 'Leave request updated');
    } catch (error) {
      next(error);
    }
  };

  getLeaveProof = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paramsParsed = positiveIdParamSchema.safeParse(req.params);
      if (!paramsParsed.success) {
        next(paramsParsed.error);
        return;
      }

      const { filePath, mimeType } = await this.getLeaveProofUseCase.execute(paramsParsed.data.id);

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', 'inline');
      res.sendFile(filePath, (err) => {
        if (err && !res.headersSent) {
          next(err);
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
