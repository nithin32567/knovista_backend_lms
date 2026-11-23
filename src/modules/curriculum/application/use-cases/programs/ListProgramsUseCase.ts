import { IProgramRepository } from '../../../domain/repositories/IProgramRepository';

export class ListProgramsUseCase {
  constructor(private readonly programRepository: IProgramRepository) {}

  async execute(status?: string) {
    const programs = await this.programRepository.findMany(status);
    return programs.map((p) => p.toResponseObject());
  }
}

