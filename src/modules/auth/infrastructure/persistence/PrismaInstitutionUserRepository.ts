import { PrismaClient } from '@prisma/client';
import { IInstitutionUserRepository } from '../../domain/repositories/IInstitutionUserRepository';
import { InstitutionUser } from '../../domain/entities/InstitutionUser';

export class PrismaInstitutionUserRepository implements IInstitutionUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<InstitutionUser | null> {
    const raw = await this.prisma.institution_users.findUnique({
      where: { id: BigInt(id) },
      include: { role: true },
    });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  async findByIdentifier(identifier: string): Promise<InstitutionUser | null> {
    const raw = await this.prisma.institution_users.findFirst({
      where: {
        status: { not: 'Deleted' },
        OR: [{ email: identifier }, { username: identifier }],
      },
      include: { role: true },
    });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.prisma.institution_users.update({
      where: { id: BigInt(id) },
      data: {
        last_login_on: new Date(),
      },
    });
  }

  private mapToDomain(raw: {
    id: bigint;
    role_id: bigint;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    mobile_no: string | null;
    password: string;
    status: string;
    gender: string;
    last_login_on: Date | null;
    created_at: Date | null;
    updated_at: Date | null;
    role: {
      name: string;
    };
  }): InstitutionUser {
    return new InstitutionUser({
      id: Number(raw.id),
      roleId: Number(raw.role_id),
      roleName: raw.role.name,
      firstName: raw.first_name,
      lastName: raw.last_name,
      username: raw.username,
      email: raw.email,
      mobileNo: raw.mobile_no,
      passwordHash: raw.password,
      status: raw.status,
      gender: raw.gender,
      lastLoginOn: raw.last_login_on,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    });
  }
}

