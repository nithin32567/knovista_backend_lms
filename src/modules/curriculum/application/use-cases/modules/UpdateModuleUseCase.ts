import { IModuleRepository, UpdateModuleData } from '../../../domain/repositories/IModuleRepository';
import { UpdateModuleInput } from '../../dto/ModuleDTO';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class UpdateModuleUseCase {
  constructor(private readonly moduleRepository: IModuleRepository) {}

  async execute(id: number, input: UpdateModuleInput, updaterId: number) {
    const updateData: UpdateModuleData = {
      updatedBy: updaterId,
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.order !== undefined) {
      updateData.order = input.order;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }

    const updated = await this.moduleRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError('Module not found');
    }
    return updated.toResponseObject();
  }
}

