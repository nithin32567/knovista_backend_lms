import bcrypt from 'bcryptjs';
import { IInstitutionUserRepository } from '../../domain/repositories/IInstitutionUserRepository';
import { IInstitutionRoleRepository } from '../../domain/repositories/IInstitutionRoleRepository';
import { CreateInstitutionUserInput } from '../dto/InstitutionUserDTO';
import { ValidationError } from '../../../../shared/errors/ValidationError';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';

export class CreateInstitutionUserUseCase {
  constructor(
    private readonly institutionUserRepository: IInstitutionUserRepository,
    private readonly institutionRoleRepository: IInstitutionRoleRepository
  ) {}

  async execute(input: CreateInstitutionUserInput, creatorId: number, profilePicPath?: string | null) {
    const role = await this.institutionRoleRepository.findById(input.role_id);
    if (!role) {
      throw new NotFoundError('Selected institution role does not exist');
    }

    const existingEmail = await this.institutionUserRepository.findByEmail(input.email);
    if (existingEmail) {
      throw new ValidationError('Email already registered', {
        email: ['The email has already been taken.'],
      });
    }

    const existingUsername = await this.institutionUserRepository.findByUsername(input.username);
    if (existingUsername) {
      throw new ValidationError('Username already registered', {
        username: ['The username has already been taken.'],
      });
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const dateOfBirth = input.date_of_birth ? new Date(input.date_of_birth) : null;

    const user = await this.institutionUserRepository.create({
      roleId: input.role_id,
      firstName: input.first_name,
      lastName: input.last_name,
      gender: input.gender,
      dateOfBirth,
      mobileNo: input.mobile_no,
      address: input.address,
      location: input.location,
      pincode: input.pincode,
      state: input.state,
      qualification: input.qualification,
      email: input.email.toLowerCase().trim(),
      username: input.username.trim(),
      passwordHash,
      profilePic: profilePicPath ?? input.profile_pic ?? null,
      createdBy: creatorId,
      updatedBy: creatorId,
    });

    return user.toResponseObject();
  }
}

