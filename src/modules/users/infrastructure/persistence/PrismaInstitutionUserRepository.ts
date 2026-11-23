import { PrismaClient, Prisma } from '@prisma/client';
import { IInstitutionUserRepository, CreateInstitutionUserData, InstitutionUserFilterParams } from '../../domain/repositories/IInstitutionUserRepository';
import { InstitutionUser, InstitutionUserProps } from '../../domain/entities/InstitutionUser';

export class PrismaInstitutionUserRepository implements IInstitutionUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(filters?: InstitutionUserFilterParams): Promise<InstitutionUser[]> {
    const where: Prisma.institution_usersWhereInput = {
      status: { not: 'Deleted' },
    };

    if (filters?.roleId !== undefined) {
      where.role_id = BigInt(filters.roleId);
    }

    if (filters?.status && filters.status !== '') {
      where.status = filters.status;
    }

    const records = await this.prisma.institution_users.findMany({
      where,
      include: { role: true },
      orderBy: { created_at: 'desc' },
    });

    return records.map((r) => this.mapToDomain(r));
  }

  async findByRoleName(roleName: string): Promise<InstitutionUser[]> {
    const records = await this.prisma.institution_users.findMany({
      where: {
        status: 'Active',
        role: {
          name: roleName,
          status: 'Active',
        },
      },
      include: { role: true },
      orderBy: { first_name: 'asc' },
    });

    return records.map((r) => this.mapToDomain(r));
  }

  async findById(id: number): Promise<InstitutionUser | null> {
    const record = await this.prisma.institution_users.findUnique({
      where: { id: BigInt(id) },
      include: { role: true },
    });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async findByEmail(email: string): Promise<InstitutionUser | null> {
    const record = await this.prisma.institution_users.findUnique({
      where: { email },
      include: { role: true },
    });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async findByUsername(username: string): Promise<InstitutionUser | null> {
    const record = await this.prisma.institution_users.findUnique({
      where: { username },
      include: { role: true },
    });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async create(data: CreateInstitutionUserData): Promise<InstitutionUser> {
    const record = await this.prisma.institution_users.create({
      data: {
        role: {
          connect: { id: BigInt(data.roleId) },
        },
        first_name: data.firstName,
        last_name: data.lastName,
        gender: data.gender,
        date_of_birth: data.dateOfBirth ?? null,
        mobile_no: data.mobileNo ?? null,
        address: data.address ?? null,
        location: data.location ?? null,
        pincode: data.pincode ?? null,
        state: data.state ?? null,
        qualification: data.qualification ?? null,
        email: data.email,
        username: data.username,
        password: data.passwordHash,
        profile_pic: data.profilePic ?? null,
        status: 'Active',
        created_by: BigInt(data.createdBy),
        updated_by: BigInt(data.updatedBy),
      },
      include: { role: true },
    });

    return this.mapToDomain(record);
  }

  private mapToDomain(raw: {
    id: bigint;
    role_id: bigint;
    first_name: string;
    last_name: string;
    gender: string;
    date_of_birth: Date | null;
    mobile_no: string | null;
    address: string | null;
    location: string | null;
    pincode: string | null;
    state: string | null;
    qualification: string | null;
    email: string;
    username: string;
    password: string;
    profile_pic: string | null;
    last_login_on: Date | null;
    status: string;
    created_by: bigint;
    updated_by: bigint;
    created_at: Date | null;
    updated_at: Date | null;
    role: {
      id: bigint;
      name: string;
      status: string;
    };
  }): InstitutionUser {
    const props: InstitutionUserProps = {
      id: Number(raw.id),
      roleId: Number(raw.role_id),
      roleName: raw.role.name,
      firstName: raw.first_name,
      lastName: raw.last_name,
      gender: raw.gender,
      dateOfBirth: raw.date_of_birth,
      mobileNo: raw.mobile_no,
      address: raw.address,
      location: raw.location,
      pincode: raw.pincode,
      state: raw.state,
      qualification: raw.qualification,
      email: raw.email,
      username: raw.username,
      passwordHash: raw.password,
      profilePic: raw.profile_pic,
      status: raw.status,
      lastLoginOn: raw.last_login_on,
      createdBy: Number(raw.created_by),
      updatedBy: Number(raw.updated_by),
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };

    return new InstitutionUser(props);
  }
}
