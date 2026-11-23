import { IPerformanceRepository } from '../../domain/repositories/IPerformanceRepository';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';

export class GetStudentModulePerformanceUseCase {
  constructor(private readonly performanceRepository: IPerformanceRepository) {}

  async execute(studentId: number) {
    const result = await this.performanceRepository.getStudentModulePerformance(studentId);
    if (!result) {
      throw new NotFoundError('Student not found');
    }

    return {
      student: {
        id: result.student.id,
        first_name: result.student.firstName,
        last_name: result.student.lastName,
        email: result.student.email,
        mobile_no: result.student.mobileNo,
      },
      data: result.modules.map((m) => ({
        module_id: m.moduleId,
        module_name: m.moduleName,
        module_priority: m.modulePriority,
        module_status: m.moduleStatus,
        section_id: m.sectionId,
        section_name: m.sectionName,
        performance: m.performance
          ? {
              student_section_module_id: m.performance.studentSectionModuleId,
              student_section_id: m.performance.studentSectionId,
              status: m.performance.status,
              performance: m.performance.performance,
              performance_description: m.performance.performanceDescription,
              performance_created_by: m.performance.performanceCreatedBy,
              performance_created_at: m.performance.performanceCreatedAt,
            }
          : null,
      })),
    };
  }
}
