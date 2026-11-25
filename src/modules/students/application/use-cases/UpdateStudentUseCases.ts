import { IStudentRepository, UpdateStudentParams } from '../../domain/repositories/IStudentRepository';
import { Student } from '../../domain/entities/Student';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { ValidationError } from '../../../../shared/errors/ValidationError';

export class UpdateStudentUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(studentId: number, data: UpdateStudentParams): Promise<Student> {
    const existing = await this.studentRepository.findById(studentId);
    if (!existing) {
      throw new NotFoundError('Student not found');
    }

    if (data.email && data.email !== existing.email) {
      const emailTaken = await this.studentRepository.findByEmail(data.email);
      if (emailTaken) {
        throw new ValidationError('Email already in use by another student');
      }
    }

    if (data.mobileNo && data.mobileNo !== existing.mobileNo) {
      const mobileTaken = await this.studentRepository.findByMobile(data.mobileNo);
      if (mobileTaken) {
        throw new ValidationError('Mobile number already in use by another student');
      }
    }

    return this.studentRepository.update(studentId, data);
  }
}

export class UpdateStudentProfileUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(studentId: number, requestingStudentId: number, data: UpdateStudentParams): Promise<Student> {
    if (studentId !== requestingStudentId) {
      throw new ValidationError('You can only update your own profile');
    }

    const existing = await this.studentRepository.findById(studentId);
    if (!existing) {
      throw new NotFoundError('Student not found');
    }

    if (data.email && data.email !== existing.email) {
      const emailTaken = await this.studentRepository.findByEmail(data.email);
      if (emailTaken) {
        throw new ValidationError('Email already in use');
      }
    }

    if (data.mobileNo && data.mobileNo !== existing.mobileNo) {
      const mobileTaken = await this.studentRepository.findByMobile(data.mobileNo);
      if (mobileTaken) {
        throw new ValidationError('Mobile number already in use');
      }
    }

    return this.studentRepository.update(studentId, data);
  }
}

export class UpdateStudentProfileImageUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(studentId: number, profilePicPath: string, updatedBy: number): Promise<void> {
    const existing = await this.studentRepository.findById(studentId);
    if (!existing) {
      throw new NotFoundError('Student not found');
    }
    await this.studentRepository.updateProfilePic(studentId, profilePicPath, updatedBy);
  }
}

