import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { prisma } from '../../config/database';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { JwtPayloadClaims } from '../types/jwt';

export function authenticate(guard: 'student' | 'institution_user' | 'any') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next(new UnauthorizedError('Missing or malformed Authorization header'));
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as unknown;
      if (typeof decoded !== 'object' || decoded === null || !('sub' in decoded)) {
        next(new UnauthorizedError('Invalid token payload structure'));
        return;
      }

      const claims = decoded as JwtPayloadClaims;
      const userId = Number(claims.sub);
      const provider = claims.prv ?? '';

      const isStudentMatch = guard === 'student' || (guard === 'any' && (provider.includes('Student') || !provider));
      const isStaffMatch = guard === 'institution_user' || (guard === 'any' && provider.includes('InstitutionUser'));

      if (isStudentMatch) {
        const student = await prisma.students.findUnique({
          where: { id: BigInt(userId) },
        });

        if (student && student.status !== 'Deleted') {
          req.user = {
            id: Number(student.id),
            type: 'student',
            entity: student,
          };
          next();
          return;
        }

        if (guard === 'student') {
          next(new UnauthorizedError('Student account not found or deactivated'));
          return;
        }
      }

      if (isStaffMatch) {
        const staff = await prisma.institution_users.findUnique({
          where: { id: BigInt(userId) },
          include: { role: true },
        });

        if (!staff || staff.status === 'Deleted') {
          next(new UnauthorizedError('Staff account not found or deactivated'));
          return;
        }

        req.user = {
          id: Number(staff.id),
          type: 'institution_user',
          role: staff.role.name,
          entity: staff,
        };
        next();
        return;
      }

      next(new UnauthorizedError('Access guard mismatch'));
    } catch {
      next(new UnauthorizedError('Token is expired or invalid'));
    }
  };
}
