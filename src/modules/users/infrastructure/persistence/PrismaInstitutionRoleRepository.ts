import { PrismaClient } from '@prisma/client';
import { IInstitutionRoleRepository } from '../../domain/repositories/IInstitutionRoleRepository';
import { InstitutionRole, InstitutionRoleProps } from '../../domain/entities/InstitutionRole';

export class PrismaInstitutionRoleRepository implements IInstitutionRoleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findActiveRoles(): Promise<InstitutionRole[]> {
    const records = await this.prisma.institution_roles.findMany({
      where: { status: 'Active' },
      orderBy: { name: 'asc' },
    });
    return records.map((r) => this.mapToDomain(r));
  }

  async findById(id: number): Promise<InstitutionRole | null> {
    const record = await this.prisma.institution_roles.findUnique({
      where: { id: BigInt(id) },
    });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async findByName(name: string): Promise<InstitutionRole | null> {
    const record = await this.prisma.institution_roles.findFirst({
      where: { name },
    });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  private mapToDomain(raw: {
    id: bigint;
    name: string;
    status: string;
    created_by: bigint;
    updated_by: bigint;
    created_at: Date | null;
    updated_at: Date | null;
  }): InstitutionRole {
    const props: InstitutionRoleProps = {
      id: Number(raw.id),
      name: raw.name,
      status: raw.status,
      createdBy: Number(raw.created_by),
      updatedBy: Number(raw.updated_by),
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
    return new InstitutionRole(props);
  }
}

