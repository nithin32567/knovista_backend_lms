import { IStudentReportRepository } from '../../../domain/repositories/IStudentReportRepository';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class DeleteStudentReportUseCase {
  constructor(private readonly reportRepository: IStudentReportRepository) {}

  async execute(reportId: number, deletedBy: number | null): Promise<void> {
    const report = await this.reportRepository.findById(reportId);

    if (!report || report.status === 'deleted') {
      throw new NotFoundError('Student report not found');
    }

    await this.reportRepository.softDelete(reportId, deletedBy);
  }
}
