import { Request, Response, NextFunction } from 'express';
import { GetAdminNotificationsUseCase } from '../../application/use-cases/GetAdminNotificationsUseCase';
import { MarkAdminNotificationsReadUseCase } from '../../application/use-cases/MarkAdminNotificationsReadUseCase';
import { MarkNotificationReadSchema } from '../../application/dto/NotificationDTO';
import { sendSuccess } from '../../../../shared/utils/response';
import { UnauthorizedError } from '../../../../shared/errors/UnauthorizedError';

export class AdminNotificationController {
  constructor(
    private readonly getNotificationsUseCase: GetAdminNotificationsUseCase,
    private readonly markReadUseCase: MarkAdminNotificationsReadUseCase
  ) {}

  index = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const notifications = await this.getNotificationsUseCase.execute(req.user.id);
      sendSuccess(res, notifications, 'Notifications retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  markRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const parsed = MarkNotificationReadSchema.parse(req.body);
      const result = await this.markReadUseCase.execute(req.user.id, parsed.notification_id);
      res.status(200).json({
        success: true,
        message: result.message,
        updated_count: result.updated_count,
      });
    } catch (error) {
      next(error);
    }
  };
}

