import { IStudentReportRepository } from '../../../domain/repositories/IStudentReportRepository';
import { StudentReportHeadResponseDTO } from '../../dto/StudentReportDTO';

export class GetReportHeadsUseCase {
  constructor(private readonly reportRepository: IStudentReportRepository) {}

  async execute(): Promise<StudentReportHeadResponseDTO[]> {
    const heads = await this.reportRepository.findActiveHeads();
    return heads.map((head) => head.toResponseObject());
  }
}
