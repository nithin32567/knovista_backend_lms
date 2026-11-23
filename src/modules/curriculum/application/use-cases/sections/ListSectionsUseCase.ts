import { ISectionRepository } from '../../../domain/repositories/ISectionRepository';

export class ListSectionsUseCase {
  constructor(private readonly sectionRepository: ISectionRepository) {}

  async execute(programId?: number | undefined, status?: string | undefined) {
    const sections = await this.sectionRepository.findMany(programId, status);
    return sections.map((s) => s.toResponseObject());
  }
}

