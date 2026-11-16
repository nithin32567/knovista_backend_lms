import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/ForbiddenError';
import { UnauthorizedError } from '../errors/UnauthorizedError';

export function requireRole(allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    if (user.type !== 'institution_user') {
      next(new ForbiddenError('Access denied: Institutional staff account required'));
      return;
    }

    if (!user.role || !allowedRoles.includes(user.role)) {
      next(new ForbiddenError(`Access denied: Requires one of [${allowedRoles.join(', ')}]`));
      return;
    }

    next();
  };
}

