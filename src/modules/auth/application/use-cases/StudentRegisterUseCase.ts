import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IStudentRepository } from '../../domain/repositories/IStudentRepository';
import { StudentRegisterInput, StudentAuthResponse } from '../dto/StudentAuthDTO';
import { ValidationError } from '../../../../shared/errors/ValidationError';
import { normalizePhoneNumber } from '../../../../shared/utils/phone';
import { env } from '../../../../config/env';

export class StudentRegisterUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(input: StudentRegisterInput): Promise<StudentAuthResponse> {
    const normalizedMobile = normalizePhoneNumber(input.mobile_no);

    const existingEmail = await this.studentRepository.findByEmail(input.email);
    if (existingEmail) {
      throw new ValidationError('Email already registered', {
        email: ['The email has already been taken.'],
      });
    }

    const existingMobile = await this.studentRepository.findByMobile(normalizedMobile);
    if (existingMobile) {
      throw new ValidationError('Mobile number already registered', {
        mobile_no: ['The mobile number has already been taken.'],
      });
    }

    const generatedUsername = this.generateUsername(input.first_name, normalizedMobile);
    const existingUsername = await this.studentRepository.findByUsername(generatedUsername);
    const finalUsername = existingUsername
      ? `${generatedUsername}${Math.floor(100 + Math.random() * 900)}`
      : generatedUsername;

    const passwordHash = await bcrypt.hash(input.password, 10);

    const student = await this.studentRepository.create({
      firstName: input.first_name,
      lastName: input.last_name,
      username: finalUsername,
      email: input.email.toLowerCase().trim(),
      mobileNo: normalizedMobile,
      passwordHash,
      gender: input.gender,
    });

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
      student: {
        id: student.id,
        first_name: student.firstName,
        last_name: student.lastName,
        email: student.email,
        username: student.username,
        mobile_no: student.mobileNo,
        gender: student.gender,
        status: student.status,
        profile_pic: null,
        date_of_birth: null,
        created_at: student.createdAt ? student.createdAt.toISOString() : null,
        last_login_on: null,
      },
    };
  }

  private generateUsername(firstName: string, mobile: string): string {
    const cleanName = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const lastFour = mobile.slice(-4);
    return `${cleanName}${lastFour}`;
  }
}

