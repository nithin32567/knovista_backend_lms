import { PrismaClient, Prisma } from '@prisma/client';
import { IModuleRepository, CreateModuleData, UpdateModuleData } from '../../domain/repositories/IModuleRepository';
import { CourseModule, CourseModuleProps } from '../../domain/entities/CourseModule';

export class PrismaModuleRepository implements IModuleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(sectionId?: number | undefined, status?: string | undefined): Promise<CourseModule[]> {
    const where: Prisma.modulesWhereInput = {};
    if (sectionId !== undefined) {
      where.section_id = BigInt(sectionId);
    }
    if (status) {
      where.status = status;
    }

    const records = await this.prisma.modules.findMany({
      where,
      include: {
        section: {
          include: {
            program: true,
          },
        },
      },
      orderBy: [{ order: 'asc' }, { created_at: 'desc' }],
    });
    return records.map((r) => this.mapToDomain(r));
  }

  async findById(id: number): Promise<CourseModule | null> {
    const record = await this.prisma.modules.findUnique({
      where: { id: BigInt(id) },
      include: {
        section: {
          include: {
            program: true,
          },
        },
      },
    });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async create(data: CreateModuleData): Promise<CourseModule> {
    const record = await this.prisma.modules.create({
      data: {
        section: {
          connect: { id: BigInt(data.sectionId) },
        },
        name: data.name,
        description: data.description ?? null,
        order: data.order ?? 0,
        status: 'Active',
        created_by: BigInt(data.createdBy),
        updated_by: BigInt(data.updatedBy),
      },
      include: {
        section: {
          include: {
            program: true,
          },
        },
      },
    });
    return this.mapToDomain(record);
  }

  async update(id: number, data: UpdateModuleData): Promise<CourseModule | null> {
    const existing = await this.prisma.modules.findUnique({ where: { id: BigInt(id) } });
    if (!existing) return null;

    const updateData: Prisma.modulesUpdateInput = {
      updated_by: BigInt(data.updatedBy),
    };

    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.order !== undefined) {
      updateData.order = data.order;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    const record = await this.prisma.modules.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        section: {
          include: {
            program: true,
          },
        },
      },
    });
    return this.mapToDomain(record);
  }

  private mapToDomain(raw: {
    id: bigint;
    section_id: bigint;
    name: string;
    description: string | null;
    order: number;
    status: string;
    created_by: bigint;
    updated_by: bigint;
    created_at: Date | null;
    updated_at: Date | null;
    section?: {
      id: bigint;
      name: string;
      program?: {
        id: bigint;
        name: string;
      } | null | undefined;
    } | null | undefined;
  }): CourseModule {
    const props: CourseModuleProps = {
      id: Number(raw.id),
      sectionId: Number(raw.section_id),
      name: raw.name,
      description: raw.description,
      order: raw.order,
      status: raw.status,
      createdBy: Number(raw.created_by),
      updatedBy: Number(raw.updated_by),
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
      section: raw.section ? {
        id: Number(raw.section.id),
        code: `SEC-${raw.section.id}`,
        name: raw.section.name,
        program: raw.section.program ? {
          id: Number(raw.section.program.id),
          code: `PROG-${raw.section.program.id}`,
          name: raw.section.program.name,
        } : undefined,
      } : undefined,
    };
    return new CourseModule(props);
  }
}
