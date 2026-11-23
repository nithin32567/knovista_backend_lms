import { IProgramExtensionRepository } from '../../../domain/repositories/IProgramExtensionRepository';

export class ListExtensionsUseCase {
  constructor(private readonly extensionRepository: IProgramExtensionRepository) {}

  async execute(studentSectionId?: number | undefined, status?: string | undefined) {
    const extensions = await this.extensionRepository.findMany(studentSectionId, status);
    return extensions.map((e) => e.toResponseObject());
  }
}

