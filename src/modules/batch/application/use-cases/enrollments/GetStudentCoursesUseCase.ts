import { NotFoundError } from '../../../../../shared/errors/NotFoundError';
import { IStudentCourseRepository, StudentCourseDetails, StudentCourseSummary } from '../../../domain/repositories/IStudentCourseRepository';

export class GetStudentCoursesUseCase {
  constructor(private readonly courseRepository: IStudentCourseRepository) {}

  async list(studentId: number): Promise<StudentCourseSummary[]> {
    return this.courseRepository.listByStudent(studentId);
  }

  async details(studentId: number, sectionId: number): Promise<StudentCourseDetails> {
    const course = await this.courseRepository.findByStudentAndSection(studentId, sectionId);
    if (!course) throw new NotFoundError('Student section not found');
    return course;
  }
}
