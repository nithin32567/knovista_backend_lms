import { Request, Response, NextFunction } from 'express';
import { ListStudentSectionsUseCase } from '../../application/use-cases/enrollments/ListStudentSectionsUseCase';
import { CreateStudentSectionUseCase } from '../../application/use-cases/enrollments/CreateStudentSectionUseCase';
import { GetStudentSectionUseCase } from '../../application/use-cases/enrollments/GetStudentSectionUseCase';
import { UpdateStudentSectionUseCase } from '../../application/use-cases/enrollments/UpdateStudentSectionUseCase';
import { DeleteStudentSectionUseCase } from '../../application/use-cases/enrollments/DeleteStudentSectionUseCase';
import { GetStudentMyBatchesUseCase } from '../../application/use-cases/enrollments/GetStudentMyBatchesUseCase';
import { GetStudentBatchModulesUseCase } from '../../application/use-cases/enrollments/GetStudentBatchModulesUseCase';
import { StudentSectionQuerySchema, CreateStudentSectionInput, UpdateStudentSectionInput } from '../../application/dto/StudentSectionDTO';
import { sendSuccess } from '../../../../shared/utils/response';
import { UnauthorizedError } from '../../../../shared/errors/UnauthorizedError';

export class StudentSectionController {
  constructor(
    private readonly listUseCase: ListStudentSectionsUseCase,
    private readonly createUseCase: CreateStudentSectionUseCase,
    private readonly getUseCase: GetStudentSectionUseCase,
    private readonly updateUseCase: UpdateStudentSectionUseCase,
    private readonly deleteUseCase: DeleteStudentSectionUseCase,
    private readonly getMyBatchesUseCase: GetStudentMyBatchesUseCase,
    private readonly getBatchModulesUseCase: GetStudentBatchModulesUseCase
  ) {}

  index = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = StudentSectionQuerySchema.parse(req.query);
      const records = await this.listUseCase.execute(query.batch_id, query.student_id, query.status);
      sendSuccess(res, records, 'Enrollments retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  store = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as CreateStudentSectionInput;
      const creatorId = req.user?.id ?? 1;
      const record = await this.createUseCase.execute(input, creatorId);
      sendSuccess(res, record, 'Student enrolled successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  show = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] ?? '0', 10);
      const record = await this.getUseCase.execute(id);
      sendSuccess(res, record, 'Enrollment retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] ?? '0', 10);
      const input = req.body as UpdateStudentSectionInput;
      const updaterId = req.user?.id ?? 1;
      const record = await this.updateUseCase.execute(id, input, updaterId);
      sendSuccess(res, record, 'Enrollment updated successfully');
    } catch (error) {
      next(error);
    }
  };

  destroy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] ?? '0', 10);
      const result = await this.deleteUseCase.execute(id);
      sendSuccess(res, null, result.message);
    } catch (error) {
      next(error);
    }
  };

  myBatches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }
      const records = await this.getMyBatchesUseCase.execute(req.user.id);
      sendSuccess(res, records, 'Batches retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  batchModules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }
      const batchId = parseInt(req.params['batchId'] ?? '0', 10);
      const modules = await this.getBatchModulesUseCase.execute(req.user.id, batchId);
      sendSuccess(res, modules, 'Batch modules retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}

