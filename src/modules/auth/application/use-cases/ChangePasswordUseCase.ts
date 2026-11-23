import bcrypt from 'bcryptjs';
import { IStudentRepository } from '../../domain/repositories/IStudentRepository';
import { ChangePasswordInput } from '../dto/StudentAuthDTO';
import { UnauthorizedError } from '../../../../shared/errors/UnauthorizedError';

export class ChangePasswordUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(studentId: number, input: ChangePasswordInput): Promise<{ message: string }> {
    const student = await this.studentRepository.findById(studentId);
    if (!student || student.status === 'Deleted') {
      throw new UnauthorizedError('Account not found');
    }

    const normalizedHash = student.passwordHash.startsWith('$2y$')
      ? student.passwordHash.replace('$2y$', '$2a$')
      : student.passwordHash;

    const isCurrentValid = await bcrypt.compare(input.current_password, normalizedHash);
    if (!isCurrentValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(input.password, 10);
    await this.studentRepository.updatePassword(student.id, newHash);

    return { message: 'Password changed successfully' };
  }
}

