import { PrismaClient, Prisma } from '@prisma/client';
import { IProgramExtensionRepository, CreateExtensionData, UpdateExtensionData } from '../../domain/repositories/IProgramExtensionRepository';
import { ProgramExtension, ProgramExtensionProps } from '../../domain/entities/ProgramExtension';

export class PrismaProgramExtensionRepository implements IProgramExtensionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(studentSectionId?: number | undefined, status?: string | undefined): Promise<ProgramExtension[]> {
    const where: Prisma.program_extensionsWhereInput = {};
    if (studentSectionId !== undefined) {
      where.student_section_id = BigInt(studentSectionId);
    }
    if (status) {
      where.status = status;
    }

    const records = await this.prisma.program_extensions.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
    return records.map((r) => this.mapToDomain(r));
  }

  async findById(id: number): Promise<ProgramExtension | null> {
    const record = await this.prisma.program_extensions.findUnique({
      where: { id: BigInt(id) },
    });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async create(data: CreateExtensionData): Promise<ProgramExtension> {
    const record = await this.prisma.program_extensions.create({
      data: {
        student_section_id: BigInt(data.studentSectionId),
        requested_by: BigInt(data.requestedBy),
        reason: data.reason,
        extension_months: data.extensionMonths,
        status: 'Pending',
      },
    });
    return this.mapToDomain(record);
  }

  async update(id: number, data: UpdateExtensionData): Promise<ProgramExtension | null> {
    const existing = await this.prisma.program_extensions.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) return null;

    const record = await this.prisma.program_extensions.update({
      where: { id: BigInt(id) },
      data: {
        status: data.status,
        reviewed_by: BigInt(data.reviewedBy),
        reviewed_at: new Date(),
      },
    });
    return this.mapToDomain(record);
  }

  private mapToDomain(raw: {
    id: bigint;
    student_section_id: bigint;
    requested_by: bigint;
    reason: string;
    extension_months: number;
    status: string;
    reviewed_by: bigint | null;
    reviewed_at: Date | null;
    created_at: Date | null;
    updated_at: Date | null;
  }): ProgramExtension {
    const props: ProgramExtensionProps = {
      id: Number(raw.id),
      studentSectionId: Number(raw.student_section_id),
      requestedBy: Number(raw.requested_by),
      reason: raw.reason,
      extensionMonths: raw.extension_months,
      status: raw.status,
      reviewedBy: raw.reviewed_by ? Number(raw.reviewed_by) : null,
      reviewedAt: raw.reviewed_at,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
    return new ProgramExtension(props);
  }
}

