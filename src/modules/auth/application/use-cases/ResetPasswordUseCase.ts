import bcrypt from 'bcryptjs';
import { IPasswordResetRepository } from '../../domain/repositories/IPasswordResetRepository';
import { ResetPasswordInput } from '../dto/StudentAuthDTO';
import { AppError } from '../../../../shared/errors/AppError';

export class ResetPasswordUseCase {
  constructor(private readonly passwordResetRepository: IPasswordResetRepository) {}

  async execute(input: ResetPasswordInput): Promise<{ message: string }> {
    const passwordHash = await bcrypt.hash(input.password, 10);
    const reset = await this.passwordResetRepository.resetStudentPassword(input.token, passwordHash);
    if (!reset) {
      throw new AppError('This password reset token is invalid or has expired', 422, 'INVALID_TOKEN');
    }
    return { message: 'Password has been reset successfully' };
  }
}
