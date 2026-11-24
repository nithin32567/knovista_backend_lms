import { IProgramRepository, UpdateProgramData } from '../../../domain/repositories/IProgramRepository';
import { UpdateProgramInput } from '../../dto/ProgramDTO';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export interface UpdateProgramFiles {
  icon?: string | null | undefined;
  coverImage?: string | null | undefined;
}

export class UpdateProgramUseCase {
  constructor(private readonly programRepository: IProgramRepository) {}

  async execute(id: number, input: UpdateProgramInput, updaterId: number, files?: UpdateProgramFiles) {
    const updateData: UpdateProgramData = {
      updatedBy: input.updated_by ?? updaterId,
    };

    if (input.code !== undefined) {
      updateData.code = input.code;
    }
    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.language !== undefined) {
      updateData.language = input.language;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    if (files?.icon !== undefined) {
      updateData.icon = files.icon;
    }
    if (files?.coverImage !== undefined) {
      updateData.coverImage = files.coverImage;
    }

    const updated = await this.programRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError('Program not found');
    }
    return updated.toResponseObject();
  }
}
