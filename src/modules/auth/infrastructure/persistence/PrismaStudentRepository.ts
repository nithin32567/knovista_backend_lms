import { PrismaClient } from '@prisma/client';
import { IStudentRepository, CreateStudentParams } from '../../domain/repositories/IStudentRepository';
import { Student } from '../../domain/entities/Student';

export class PrismaStudentRepository implements IStudentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<Student | null> {
    const raw = await this.prisma.students.findUnique({
      where: { id: BigInt(id) },
    });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  async findByIdentifier(identifier: string): Promise<Student | null> {
    const raw = await this.prisma.students.findFirst({
      where: {
        status: { not: 'Deleted' },
        OR: [
          { email: identifier },
          { username: identifier },
          { mobile_no: identifier },
        ],
      },
    });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  async findByEmail(email: string): Promise<Student | null> {
    const raw = await this.prisma.students.findUnique({
      where: { email },
    });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  async findByUsername(username: string): Promise<Student | null> {
    const raw = await this.prisma.students.findUnique({
      where: { username },
    });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  async findByMobile(mobileNo: string): Promise<Student | null> {
    const raw = await this.prisma.students.findFirst({
      where: { mobile_no: mobileNo },
    });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  async create(params: CreateStudentParams): Promise<Student> {
    const raw = await this.prisma.students.create({
      data: {
        first_name: params.firstName,
        last_name: params.lastName,
        username: params.username,
        email: params.email,
        mobile_no: params.mobileNo,
        password: params.passwordHash,
        gender: params.gender,
        status: 'Active',
        login_status: 'inactive',
        created_by: BigInt(1),
        updated_by: BigInt(1),
      },
    });
    return this.mapToDomain(raw);
  }

  async updateLoginStatus(id: number, status: string): Promise<void> {
    await this.prisma.students.update({
      where: { id: BigInt(id) },
      data: {
        login_status: status,
        last_login_on: new Date(),
        login_status_updated_at: new Date(),
      },
    });
  }

  private mapToDomain(raw: {
    id: bigint;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    mobile_no: string;
    password: string;
    status: string;
    gender: string;
    login_status: string;
    last_login_on: Date | null;
    created_at: Date | null;
    updated_at: Date | null;
  }): Student {
    return new Student({
      id: Number(raw.id),
      firstName: raw.first_name,
      lastName: raw.last_name,
      username: raw.username,
      email: raw.email,
      mobileNo: raw.mobile_no,
      passwordHash: raw.password,
      status: raw.status,
      gender: raw.gender,
      loginStatus: raw.login_status,
      lastLoginOn: raw.last_login_on,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    });
  }
}

