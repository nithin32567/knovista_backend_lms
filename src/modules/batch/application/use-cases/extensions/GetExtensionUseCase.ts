import { IProgramExtensionRepository } from '../../../domain/repositories/IProgramExtensionRepository';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class GetExtensionUseCase {
  constructor(private readonly extensionRepository: IProgramExtensionRepository) {}

  async execute(id: number) {
    const extension = await this.extensionRepository.findById(id);
    if (!extension) {
      throw new NotFoundError('Extension request not found');
    }
    return extension.toResponseObject();
  }
}

