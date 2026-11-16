import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IInstitutionUserRepository } from '../../domain/repositories/IInstitutionUserRepository';
import { StaffLoginInput, StaffAuthResponse } from '../dto/StaffAuthDTO';
import { UnauthorizedError } from '../../../../shared/errors/UnauthorizedError';
import { ForbiddenError } from '../../../../shared/errors/ForbiddenError';
import { env } from '../../../../config/env';

export class StaffLoginUseCase {
  constructor(private readonly institutionUserRepository: IInstitutionUserRepository) {}

  async execute(input: StaffLoginInput): Promise<StaffAuthResponse> {
    const staff = await this.institutionUserRepository.findByIdentifier(input.email_or_username);
    if (!staff) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!staff.isEligibleForLogin()) {
      throw new ForbiddenError('Staff account is inactive or blocked');
    }

    const normalizedHash = staff.passwordHash.startsWith('$2y$')
      ? staff.passwordHash.replace('$2y$', '$2a$')
      : staff.passwordHash;

    const isPasswordValid = await bcrypt.compare(input.password, normalizedHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    await this.institutionUserRepository.updateLastLogin(staff.id);

    const tokenPayload = {
      sub: staff.id,
      prv: 'App\\Models\\InstitutionUser',
      role: staff.roleName,
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
        id: staff.id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        username: staff.username,
        role: staff.roleName,
      },
    };
  }
}

