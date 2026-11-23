import bcrypt from 'bcryptjs';
import { IStudentRepository } from '../../domain/repositories/IStudentRepository';
import { CreateStudentInput } from '../dto/StudentDTO';
import { ValidationError } from '../../../../shared/errors/ValidationError';

export class CreateStudentUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(input: CreateStudentInput, creatorId: number) {
    const existingEmail = await this.studentRepository.findByEmail(input.email);
    if (existingEmail) {
      throw new ValidationError('Email already registered', {
        email: ['The email has already been taken.'],
      });
    }

    const existingUsername = await this.studentRepository.findByUsername(input.username);
    if (existingUsername) {
      throw new ValidationError('Username already registered', {
        username: ['The username has already been taken.'],
      });
    }

    if (input.mobile_no && input.mobile_no !== '0000000000') {
      const existingMobile = await this.studentRepository.findByMobile(input.mobile_no);
      if (existingMobile) {
        throw new ValidationError('Mobile number already registered', {
          mobile_no: ['The mobile number has already been taken.'],
        });
      }
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const dateOfBirth = input.date_of_birth ? new Date(input.date_of_birth) : null;

    const student = await this.studentRepository.create({
      firstName: input.first_name,
      lastName: input.last_name,
      gender: input.gender,
      dateOfBirth,
      mobileNo: input.mobile_no,
      alternateMobileNo: input.alternate_mobile_no,
      parentMobileNo: input.parent_mobile_no,
      parentName: input.parent_name,
      address: input.address,
      location: input.location,
      pincode: input.pincode,
      state: input.state,
      email: input.email.toLowerCase().trim(),
      username: input.username.trim(),
      passwordHash,
      qualification: input.qualification,
      specialCategoryId: input.special_category_id,
      salesPersonName: input.sales_person_name,
      salesPersonPhone: input.sales_person_phone,
      paidAmount: input.paid_amount,
      createdBy: creatorId,
      updatedBy: creatorId,
    });

    return student.toResponseObject();
  }
}

