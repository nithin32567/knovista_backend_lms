import { Request, Response, NextFunction } from 'express';
import { GetStudentNotificationsUseCase, MarkStudentNotificationsViewedUseCase } from '../../application/use-cases/StudentNotificationUseCases';
import { StudentNotificationsQuerySchema, MarkStudentNotificationsViewedSchema } from '../../application/dto/NotificationDTO';
import { sendSuccess } from '../../../../shared/utils/response';
import { ValidationError } from '../../../../shared/errors/ValidationError';
import { UnauthorizedError } from '../../../../shared/errors/UnauthorizedError';
import { ForbiddenError } from '../../../../shared/errors/ForbiddenError';

export class StudentNotificationController {
  constructor(
    private readonly getNotificationsUseCase: GetStudentNotificationsUseCase,
    private readonly markViewedUseCase: MarkStudentNotificationsViewedUseCase,
  ) {}

  private resolveStudentId(req: Request, requestedId?: number): number {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (req.user.type === 'student') {
      if (requestedId !== undefined && requestedId !== req.user.id) {
        throw new ForbiddenError('Access denied');
      }
      return req.user.id;
    }

    if (!requestedId) {
      throw new ValidationError('student_id is required');
    }

    return requestedId;
  }

  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = StudentNotificationsQuerySchema.parse(req.query);
      const studentId = this.resolveStudentId(req, query.student_id);
      const result = await this.getNotificationsUseCase.execute(studentId);
      sendSuccess(
        res,
        {
          notifications: result.notifications.map((n) => n.toResponseObject()),
          new_count: result.newCount,
        },
        'Notifications retrieved'
      );
    } catch (error) {
      next(error);
    }
  };

  markViewed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = MarkStudentNotificationsViewedSchema.parse(req.body);
      const studentId = this.resolveStudentId(req, body.student_id);
      const result = await this.markViewedUseCase.execute(studentId);
      res.status(200).json({
        success: true,
        message: 'All new notifications marked as viewed',
        updated_count: result.updatedCount,
      });
    } catch (error) {
      next(error);
    }
  };
}
