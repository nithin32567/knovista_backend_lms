import { Request, Response, NextFunction } from 'express';
import { ListProgramsUseCase } from '../../application/use-cases/programs/ListProgramsUseCase';
import { CreateProgramUseCase } from '../../application/use-cases/programs/CreateProgramUseCase';
import { GetProgramUseCase } from '../../application/use-cases/programs/GetProgramUseCase';
import { UpdateProgramUseCase } from '../../application/use-cases/programs/UpdateProgramUseCase';
import { ProgramQuerySchema, CreateProgramInput, UpdateProgramInput } from '../../application/dto/ProgramDTO';
import { sendSuccess } from '../../../../shared/utils/response';

export class ProgramController {
  constructor(
    private readonly listProgramsUseCase: ListProgramsUseCase,
    private readonly createProgramUseCase: CreateProgramUseCase,
    private readonly getProgramUseCase: GetProgramUseCase,
    private readonly updateProgramUseCase: UpdateProgramUseCase,
  ) {}

  index = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = ProgramQuerySchema.parse(req.query);
      const programs = await this.listProgramsUseCase.execute(query);
      sendSuccess(res, programs, 'Programs retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  store = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as CreateProgramInput;
      const creatorId = req.user?.id ?? 1;

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const iconFile = files?.['icon']?.[0];
      const coverFile = files?.['cover_image']?.[0];

      const iconPath = iconFile ? `/storage/programs/${iconFile.filename}` : undefined;
      const coverPath = coverFile ? `/storage/programs/${coverFile.filename}` : undefined;

      const program = await this.createProgramUseCase.execute(input, creatorId, {
        icon: iconPath,
        coverImage: coverPath,
      });
      sendSuccess(res, program, 'Program created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  show = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] ?? '0', 10);
      const program = await this.getProgramUseCase.execute(id);
      sendSuccess(res, program, 'Program retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] ?? '0', 10);
      const input = req.body as UpdateProgramInput;
      const updaterId = req.user?.id ?? 1;

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const iconFile = files?.['icon']?.[0];
      const coverFile = files?.['cover_image']?.[0];

      const iconPath = iconFile ? `/storage/programs/${iconFile.filename}` : undefined;
      const coverPath = coverFile ? `/storage/programs/${coverFile.filename}` : undefined;

      const program = await this.updateProgramUseCase.execute(id, input, updaterId, {
        icon: iconPath,
        coverImage: coverPath,
      });
      sendSuccess(res, program, 'Program updated successfully');
    } catch (error) {
      next(error);
    }
  };
}
