import bcrypt from 'bcryptjs';
import { IStudentRepository } from '../../domain/repositories/IStudentRepository';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { AdminResetStudentPasswordInput } from '../dto/StudentDTO';

export class ResetStudentPasswordUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(input: AdminResetStudentPasswordInput, currentUserId?: number | undefined) {
    const student = await this.studentRepository.findById(input.student_id);
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.new_password, salt);
    const updatedBy = input.reseted_by ?? currentUserId ?? student.updatedBy;

    await this.studentRepository.updatePassword(student.id, passwordHash, updatedBy);

    return {
      message: 'Student password reset successfully',
    };
  }
}
