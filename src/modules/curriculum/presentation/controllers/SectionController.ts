import { Request, Response, NextFunction } from 'express';
import { ListSectionsUseCase } from '../../application/use-cases/sections/ListSectionsUseCase';
import { CreateSectionUseCase } from '../../application/use-cases/sections/CreateSectionUseCase';
import { GetSectionUseCase } from '../../application/use-cases/sections/GetSectionUseCase';
import { UpdateSectionUseCase } from '../../application/use-cases/sections/UpdateSectionUseCase';
import { SectionQuerySchema, CreateSectionInput, UpdateSectionInput } from '../../application/dto/SectionDTO';
import { sendSuccess } from '../../../../shared/utils/response';

export class SectionController {
  constructor(
    private readonly listSectionsUseCase: ListSectionsUseCase,
    private readonly createSectionUseCase: CreateSectionUseCase,
    private readonly getSectionUseCase: GetSectionUseCase,
    private readonly updateSectionUseCase: UpdateSectionUseCase
  ) {}

  index = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = SectionQuerySchema.parse(req.query);
      const sections = await this.listSectionsUseCase.execute(query.program_id, query.status);
      sendSuccess(res, sections, 'Sections retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  store = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as CreateSectionInput;
      const creatorId = req.user?.id ?? 1;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const iconFile = files?.['icon']?.[0];
      const coverImageFile = files?.['cover_image']?.[0];
      const icon = iconFile ? `/storage/sections/${iconFile.filename}` : (input.icon ?? undefined);
      const coverImage = coverImageFile ? `/storage/sections/${coverImageFile.filename}` : (input.cover_image ?? undefined);

      const section = await this.createSectionUseCase.execute(
        {
          ...input,
          icon,
          cover_image: coverImage,
        },
        creatorId
      );
      sendSuccess(res, section, 'Section created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  show = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] ?? '0', 10);
      const section = await this.getSectionUseCase.execute(id);
      sendSuccess(res, section, 'Section retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params['id'] ?? '0', 10);
      const input = req.body as UpdateSectionInput;
      const updaterId = req.user?.id ?? 1;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const iconFile = files?.['icon']?.[0];
      const coverImageFile = files?.['cover_image']?.[0];
      const icon = iconFile ? `/storage/sections/${iconFile.filename}` : input.icon;
      const coverImage = coverImageFile ? `/storage/sections/${coverImageFile.filename}` : input.cover_image;

      const section = await this.updateSectionUseCase.execute(
        id,
        {
          ...input,
          ...(icon !== undefined ? { icon } : {}),
          ...(coverImage !== undefined ? { cover_image: coverImage } : {}),
        },
        updaterId
      );
      sendSuccess(res, section, 'Section updated successfully');
    } catch (error) {
      next(error);
    }
  };
}
