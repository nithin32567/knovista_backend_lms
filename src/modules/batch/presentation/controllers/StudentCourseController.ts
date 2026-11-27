import { NextFunction, Request, Response } from 'express';
import { ForbiddenError } from '../../../../shared/errors/ForbiddenError';
import { UnauthorizedError } from '../../../../shared/errors/UnauthorizedError';
import { sendSuccess } from '../../../../shared/utils/response';
import { StudentCourseDetailsInput, StudentCourseListInput } from '../../application/dto/StudentSectionDTO';
import { GetStudentCoursesUseCase } from '../../application/use-cases/enrollments/GetStudentCoursesUseCase';

export class StudentCourseController {
  constructor(private readonly getStudentCourses: GetStudentCoursesUseCase) {}

  list = async (req: Request<object, unknown, StudentCourseListInput>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = this.studentId(req);
      sendSuccess(res, await this.getStudentCourses.list(studentId));
    } catch (error) {
      next(error);
    }
  };

  details = async (req: Request<object, unknown, StudentCourseDetailsInput>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = this.studentId(req);
      sendSuccess(res, await this.getStudentCourses.details(studentId, req.body.section_id));
    } catch (error) {
      next(error);
    }
  };

  private studentId(req: Request<object, unknown, StudentCourseListInput>): number {
    if (req.user?.type !== 'student') throw new UnauthorizedError('Student authentication required');
    if (req.body.student_id !== undefined && req.body.student_id !== req.user.id) {
      throw new ForbiddenError('Student course access denied');
    }
    return req.user.id;
  }
}
