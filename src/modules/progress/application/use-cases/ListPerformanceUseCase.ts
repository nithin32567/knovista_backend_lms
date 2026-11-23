import { IPerformanceRepository } from '../../domain/repositories/IPerformanceRepository';
import { ListPerformanceQueryInput } from '../dto/ProgressDTO';

export class ListPerformanceUseCase {
  constructor(private readonly performanceRepository: IPerformanceRepository) {}

  async execute(query: ListPerformanceQueryInput) {
    const { items, isCertificate } = await this.performanceRepository.listPerformances({
      studentId: query.student_id,
      studentSectionId: query.student_section_id,
      batchId: query.batch_id,
      sectionId: query.section_id,
      moduleId: query.module_id,
      performance: query.performance,
      onlyWithPerformance: query.only_with_performance ?? true,
    });

    return {
      is_certificate: isCertificate,
      data: items.map((item) => item.toResponseObject()),
    };
  }
}
