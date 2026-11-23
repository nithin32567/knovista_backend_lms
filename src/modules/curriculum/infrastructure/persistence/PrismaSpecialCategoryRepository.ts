import { PrismaClient, Prisma } from '@prisma/client';
import { ISpecialCategoryRepository, CreateSpecialCategoryData, UpdateSpecialCategoryData } from '../../domain/repositories/ISpecialCategoryRepository';
import { SpecialCategory, SpecialCategoryProps } from '../../domain/entities/SpecialCategory';

export class PrismaSpecialCategoryRepository implements ISpecialCategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(status?: string | undefined): Promise<SpecialCategory[]> {
    const where: Prisma.special_categoriesWhereInput = {};
    if (status) {
      where.status = status;
    }

    const records = await this.prisma.special_categories.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
    return records.map((r) => this.mapToDomain(r));
  }

  async findById(id: number): Promise<SpecialCategory | null> {
    const record = await this.prisma.special_categories.findUnique({ where: { id: BigInt(id) } });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async create(data: CreateSpecialCategoryData): Promise<SpecialCategory> {
    const record = await this.prisma.special_categories.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        status: 'Active',
        created_by: BigInt(data.createdBy),
        updated_by: BigInt(data.updatedBy),
      },
    });
    return this.mapToDomain(record);
  }

  async update(id: number, data: UpdateSpecialCategoryData): Promise<SpecialCategory | null> {
    const existing = await this.prisma.special_categories.findUnique({ where: { id: BigInt(id) } });
    if (!existing) return null;

    const updateData: Prisma.special_categoriesUpdateInput = {
      updated_by: BigInt(data.updatedBy),
    };

    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    const record = await this.prisma.special_categories.update({
      where: { id: BigInt(id) },
      data: updateData,
    });
    return this.mapToDomain(record);
  }

  private mapToDomain(raw: {
    id: bigint;
    name: string;
    description: string | null;
    status: string;
    created_by: bigint;
    updated_by: bigint;
    created_at: Date | null;
    updated_at: Date | null;
  }): SpecialCategory {
    const props: SpecialCategoryProps = {
      id: Number(raw.id),
      name: raw.name,
      description: raw.description,
      status: raw.status,
      createdBy: Number(raw.created_by),
      updatedBy: Number(raw.updated_by),
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
    return new SpecialCategory(props);
  }
}
