import { IProgramRepository, UpdateProgramData } from '../../../domain/repositories/IProgramRepository';
import { UpdateProgramInput } from '../../dto/ProgramDTO';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class UpdateProgramUseCase {
  constructor(private readonly programRepository: IProgramRepository) {}

  async execute(id: number, input: UpdateProgramInput, updaterId: number) {
    const updateData: UpdateProgramData = {
      updatedBy: updaterId,
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }

    const updated = await this.programRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError('Program not found');
    }
    return updated.toResponseObject();
  }
}
