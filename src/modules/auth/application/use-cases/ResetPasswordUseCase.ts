import bcrypt from 'bcryptjs';
import { IStudentRepository } from '../../domain/repositories/IStudentRepository';
import { IPasswordResetRepository } from '../../domain/repositories/IPasswordResetRepository';
import { ResetPasswordInput } from '../dto/StudentAuthDTO';
import { AppError } from '../../../../shared/errors/AppError';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';

export class ResetPasswordUseCase {
  constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly passwordResetRepository: IPasswordResetRepository
  ) {}

  async execute(input: ResetPasswordInput): Promise<{ message: string }> {
    const record = await this.passwordResetRepository.findValidToken(input.token, 'student');
    if (!record) {
      throw new AppError('This password reset token is invalid or has expired', 422, 'INVALID_TOKEN');
    }

    const student = await this.studentRepository.findByEmail(record.email);
    if (!student || student.status === 'Deleted') {
      throw new NotFoundError('Account associated with this token was not found');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    await this.studentRepository.updatePassword(student.id, passwordHash);
    await this.passwordResetRepository.deleteByEmail(record.email, 'student');

    return { message: 'Password has been reset successfully' };
  }
}

