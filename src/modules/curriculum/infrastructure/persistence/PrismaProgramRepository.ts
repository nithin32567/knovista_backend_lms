import { PrismaClient, Prisma } from '@prisma/client';
import {
  IProgramRepository,
  CreateProgramData,
  UpdateProgramData,
  ProgramFilter,
} from '../../domain/repositories/IProgramRepository';
import { Program, ProgramProps } from '../../domain/entities/Program';

export class PrismaProgramRepository implements IProgramRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(filter?: ProgramFilter | string | undefined): Promise<Program[]> {
    const where: Prisma.programsWhereInput = {};
    if (typeof filter === 'string') {
      where.status = filter;
    } else if (filter) {
      if (filter.status) where.status = filter.status;
      if (filter.language) where.language = filter.language;
      if (filter.code) where.code = { contains: filter.code };
      if (filter.name) where.name = { contains: filter.name };
    }

    const records = await this.prisma.programs.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
    return records.map((r) => this.mapToDomain(r));
  }

  async findById(id: number): Promise<Program | null> {
    const record = await this.prisma.programs.findUnique({ where: { id: BigInt(id) } });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async create(data: CreateProgramData): Promise<Program> {
    const record = await this.prisma.programs.create({
      data: {
        code: data.code ?? null,
        name: data.name,
        description: data.description ?? null,
        language: data.language ?? 'English',
        icon: data.icon ?? null,
        cover_image: data.coverImage ?? null,
        status: data.status ?? 'Active',
        created_by: BigInt(data.createdBy),
        updated_by: BigInt(data.updatedBy),
      },
    });
    return this.mapToDomain(record);
  }

  async update(id: number, data: UpdateProgramData): Promise<Program | null> {
    const existing = await this.prisma.programs.findUnique({ where: { id: BigInt(id) } });
    if (!existing) return null;

    const updateData: Prisma.programsUpdateInput = {
      updated_by: BigInt(data.updatedBy),
    };

    if (data.code !== undefined) {
      updateData.code = data.code;
    }
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.language !== undefined) {
      updateData.language = data.language;
    }
    if (data.icon !== undefined) {
      updateData.icon = data.icon;
    }
    if (data.coverImage !== undefined) {
      updateData.cover_image = data.coverImage;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    const record = await this.prisma.programs.update({
      where: { id: BigInt(id) },
      data: updateData,
    });
    return this.mapToDomain(record);
  }

  private mapToDomain(raw: {
    id: bigint;
    code: string | null;
    name: string;
    description: string | null;
    language: string;
    icon: string | null;
    cover_image: string | null;
    status: string;
    created_by: bigint;
    updated_by: bigint;
    created_at: Date | null;
    updated_at: Date | null;
  }): Program {
    const props: ProgramProps = {
      id: Number(raw.id),
      code: raw.code,
      name: raw.name,
      description: raw.description,
      language: raw.language,
      icon: raw.icon,
      coverImage: raw.cover_image,
      status: raw.status,
      createdBy: Number(raw.created_by),
      updatedBy: Number(raw.updated_by),
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
    return new Program(props);
  }
}
