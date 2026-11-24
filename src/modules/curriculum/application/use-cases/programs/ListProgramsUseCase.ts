import { IProgramRepository, ProgramFilter } from '../../../domain/repositories/IProgramRepository';

export class ListProgramsUseCase {
  constructor(private readonly programRepository: IProgramRepository) {}

  async execute(filter?: ProgramFilter | string) {
    const programs = await this.programRepository.findMany(filter);
    return programs.map((p) => p.toResponseObject());
  }
}
