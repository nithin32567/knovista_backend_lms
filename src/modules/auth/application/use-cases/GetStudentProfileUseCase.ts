import { IStudentRepository } from '../../domain/repositories/IStudentRepository';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';

export interface StudentProfileOutput {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  username: string;
  mobileNo: string;
  gender: string;
  status: string;
  lastLoginOn: Date | null;
}

export class GetStudentProfileUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(studentId: number): Promise<StudentProfileOutput> {
    const student = await this.studentRepository.findById(studentId);
    if (!student || student.status === 'Deleted') {
      throw new NotFoundError('Student profile not found');
    }

    return {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      fullName: student.fullName,
      email: student.email,
      username: student.username,
      mobileNo: student.mobileNo,
      gender: student.gender,
      status: student.status,
      lastLoginOn: student.lastLoginOn,
    };
  }
}

