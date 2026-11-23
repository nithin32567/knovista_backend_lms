import { IPerformanceRepository } from '../../domain/repositories/IPerformanceRepository';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { SavePerformanceInput } from '../dto/ProgressDTO';

export class RecordPerformanceUseCase {
  constructor(private readonly performanceRepository: IPerformanceRepository) {}

  async execute(input: SavePerformanceInput, userId: number) {
    const result = await this.performanceRepository.savePerformance(
      input.student_section_module_id,
      input.performance,
      input.performance_description ?? null,
      userId
    );

    if (!result) {
      throw new NotFoundError('Record not found');
    }

    return result.toResponseObject();
  }
}
