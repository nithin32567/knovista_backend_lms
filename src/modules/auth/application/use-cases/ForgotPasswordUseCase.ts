import crypto from 'crypto';
import { IStudentRepository } from '../../domain/repositories/IStudentRepository';
import { IPasswordResetRepository } from '../../domain/repositories/IPasswordResetRepository';
import { ForgotPasswordInput } from '../dto/StudentAuthDTO';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';

export class ForgotPasswordUseCase {
  constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly passwordResetRepository: IPasswordResetRepository
  ) {}

  async execute(input: ForgotPasswordInput): Promise<{ message: string }> {
    const student = await this.studentRepository.findByEmail(input.email);
    if (!student || student.status === 'Deleted') {
      throw new NotFoundError('No account found with this email address');
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.passwordResetRepository.create({
      email: student.email,
      token: rawToken,
      guard: 'student',
      expiresAt,
    });

    return {
      message: 'Password reset instructions have been sent to your email address',
    };
  }
}

