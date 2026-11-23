import { PrismaClient, Prisma } from '@prisma/client';
import { ISectionRepository, CreateSectionData, UpdateSectionData } from '../../domain/repositories/ISectionRepository';
import { Section, SectionProps } from '../../domain/entities/Section';

export class PrismaSectionRepository implements ISectionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(programId?: number | undefined, status?: string | undefined): Promise<Section[]> {
    const where: Prisma.sectionsWhereInput = {};
    if (programId !== undefined) {
      where.program_id = BigInt(programId);
    }
    if (status) {
      where.status = status;
    }

    const records = await this.prisma.sections.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
    return records.map((r) => this.mapToDomain(r));
  }

  async findById(id: number): Promise<Section | null> {
    const record = await this.prisma.sections.findUnique({ where: { id: BigInt(id) } });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async create(data: CreateSectionData): Promise<Section> {
    const record = await this.prisma.sections.create({
      data: {
        program: {
          connect: { id: BigInt(data.programId) },
        },
        name: data.name,
        description: data.description ?? null,
        duration_in_months: data.durationInMonths ?? null,
        status: 'Active',
        created_by: BigInt(data.createdBy),
        updated_by: BigInt(data.updatedBy),
      },
    });
    return this.mapToDomain(record);
  }

  async update(id: number, data: UpdateSectionData): Promise<Section | null> {
    const existing = await this.prisma.sections.findUnique({ where: { id: BigInt(id) } });
    if (!existing) return null;

    const updateData: Prisma.sectionsUpdateInput = {
      updated_by: BigInt(data.updatedBy),
    };

    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.durationInMonths !== undefined) {
      updateData.duration_in_months = data.durationInMonths;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    const record = await this.prisma.sections.update({
      where: { id: BigInt(id) },
      data: updateData,
    });
    return this.mapToDomain(record);
  }

  private mapToDomain(raw: {
    id: bigint;
    program_id: bigint;
    name: string;
    description: string | null;
    duration_in_months: number | null;
    status: string;
    created_by: bigint;
    updated_by: bigint;
    created_at: Date | null;
    updated_at: Date | null;
  }): Section {
    const props: SectionProps = {
      id: Number(raw.id),
      programId: Number(raw.program_id),
      name: raw.name,
      description: raw.description,
      durationInMonths: raw.duration_in_months,
      status: raw.status,
      createdBy: Number(raw.created_by),
      updatedBy: Number(raw.updated_by),
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
    return new Section(props);
  }
}
