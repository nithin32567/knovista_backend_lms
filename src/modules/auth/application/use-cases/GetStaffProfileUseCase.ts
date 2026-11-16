import { IInstitutionUserRepository } from '../../domain/repositories/IInstitutionUserRepository';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';

export interface StaffProfileOutput {
  id: number;
  roleId: number;
  roleName: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  username: string;
  mobileNo: string | null;
  gender: string;
  status: string;
  lastLoginOn: Date | null;
}

export class GetStaffProfileUseCase {
  constructor(private readonly institutionUserRepository: IInstitutionUserRepository) {}

  async execute(staffId: number): Promise<StaffProfileOutput> {
    const staff = await this.institutionUserRepository.findById(staffId);
    if (!staff || staff.status === 'Deleted') {
      throw new NotFoundError('Staff profile not found');
    }

    return {
      id: staff.id,
      roleId: staff.roleId,
      roleName: staff.roleName,
      firstName: staff.firstName,
      lastName: staff.lastName,
      fullName: staff.fullName,
      email: staff.email,
      username: staff.username,
      mobileNo: staff.mobileNo,
      gender: staff.gender,
      status: staff.status,
      lastLoginOn: staff.lastLoginOn,
    };
  }
}

