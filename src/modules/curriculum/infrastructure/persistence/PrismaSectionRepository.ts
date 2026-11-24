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
      include: {
        program: true,
      },
      orderBy: { created_at: 'desc' },
    });
    return records.map((r) => this.mapToDomain(r));
  }

  async findById(id: number): Promise<Section | null> {
    const record = await this.prisma.sections.findUnique({
      where: { id: BigInt(id) },
      include: {
        program: true,
      },
    });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async create(data: CreateSectionData): Promise<Section> {
    const record = await this.prisma.sections.create({
      data: {
        program: {
          connect: { id: BigInt(data.programId) },
        },
        code: data.code ?? null,
        name: data.name,
        icon: data.icon ?? null,
        cover_image: data.coverImage ?? null,
        duration: data.duration ?? null,
        amount: data.amount !== undefined && data.amount !== null ? data.amount : 0,
        priority: data.priority ?? 0,
        description: data.description ?? null,
        duration_in_months: data.durationInMonths ?? null,
        status: data.status ?? 'Active',
        is_demo: data.isDemo ?? false,
        created_by: BigInt(data.createdBy),
        updated_by: BigInt(data.updatedBy),
      },
      include: {
        program: true,
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

    if (data.programId !== undefined) {
      updateData.program = {
        connect: { id: BigInt(data.programId) },
      };
    }
    if (data.code !== undefined) {
      updateData.code = data.code;
    }
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.icon !== undefined) {
      updateData.icon = data.icon;
    }
    if (data.coverImage !== undefined) {
      updateData.cover_image = data.coverImage;
    }
    if (data.duration !== undefined) {
      updateData.duration = data.duration;
    }
    if (data.amount !== undefined) {
      updateData.amount = data.amount;
    }
    if (data.priority !== undefined) {
      updateData.priority = data.priority;
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
    if (data.isDemo !== undefined) {
      updateData.is_demo = data.isDemo;
    }

    const record = await this.prisma.sections.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        program: true,
      },
    });
    return this.mapToDomain(record);
  }

  private mapToDomain(raw: {
    id: bigint;
    program_id: bigint;
    code: string | null;
    name: string;
    icon: string | null;
    cover_image: string | null;
    duration: string | null;
    amount: Prisma.Decimal | null;
    priority: number | null;
    description: string | null;
    duration_in_months: number | null;
    status: string;
    is_demo: boolean;
    created_by: bigint;
    updated_by: bigint;
    created_at: Date | null;
    updated_at: Date | null;
    program?: {
      id: bigint;
      code?: string | null;
      name: string;
    } | null | undefined;
  }): Section {
    const props: SectionProps = {
      id: Number(raw.id),
      programId: Number(raw.program_id),
      code: raw.code,
      name: raw.name,
      icon: raw.icon,
      coverImage: raw.cover_image,
      duration: raw.duration,
      amount: raw.amount ? Number(raw.amount) : 0,
      priority: raw.priority ?? 0,
      description: raw.description,
      durationInMonths: raw.duration_in_months,
      status: raw.status,
      isDemo: Boolean(raw.is_demo),
      createdBy: Number(raw.created_by),
      updatedBy: Number(raw.updated_by),
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
      program: raw.program ? {
        id: Number(raw.program.id),
        code: raw.program.code ?? `PROG-${raw.program.id}`,
        name: raw.program.name,
      } : {
        id: Number(raw.program_id),
        code: `PROG-${raw.program_id}`,
        name: '',
      },
    };
    return new Section(props);
  }
}
