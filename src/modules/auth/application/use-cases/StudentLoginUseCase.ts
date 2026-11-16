import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IStudentRepository } from '../../domain/repositories/IStudentRepository';
import { StudentLoginInput, StudentAuthResponse } from '../dto/StudentAuthDTO';
import { UnauthorizedError } from '../../../../shared/errors/UnauthorizedError';
import { ForbiddenError } from '../../../../shared/errors/ForbiddenError';
import { env } from '../../../../config/env';

export class StudentLoginUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(input: StudentLoginInput): Promise<StudentAuthResponse> {
    const student = await this.studentRepository.findByIdentifier(
      input.email_or_username_or_mobile
    );

    if (!student) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (student.isBlocked()) {
      throw new ForbiddenError('Your account has been blocked. Please contact support.');
    }

    if (!student.isEligibleForLogin()) {
      throw new ForbiddenError('Account is inactive or dropped.');
    }

    const normalizedHash = student.passwordHash.startsWith('$2y$')
      ? student.passwordHash.replace('$2y$', '$2a$')
      : student.passwordHash;

    const isPasswordValid = await bcrypt.compare(input.password, normalizedHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    await this.studentRepository.updateLoginStatus(student.id, 'active');

    const tokenPayload = {
      sub: student.id,
      prv: 'App\\Models\\Student',
    };

    const token = jwt.sign(tokenPayload, env.JWT_SECRET, {
      expiresIn: `${env.JWT_TTL}s`,
      algorithm: 'HS256',
    });

    return {
      token,
      tokenType: 'bearer',
      expiresIn: env.JWT_TTL,
      user: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        username: student.username,
        mobileNo: student.mobileNo,
        role: 'student',
      },
    };
  }
}

