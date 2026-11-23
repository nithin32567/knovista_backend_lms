import { PrismaClient, Prisma } from '@prisma/client';
import { IBatchRepository, CreateBatchData, UpdateBatchData } from '../../domain/repositories/IBatchRepository';
import { ProgramSectionBatch, ProgramSectionBatchProps } from '../../domain/entities/ProgramSectionBatch';

export class PrismaBatchRepository implements IBatchRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(sectionId?: number | undefined, status?: string | undefined): Promise<ProgramSectionBatch[]> {
    const where: Prisma.program_section_batchesWhereInput = {};
    if (sectionId !== undefined) {
      where.section_id = BigInt(sectionId);
    }
    if (status) {
      where.status = status;
    }

    const records = await this.prisma.program_section_batches.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
    return records.map((r) => this.mapToDomain(r));
  }

  async findById(id: number): Promise<ProgramSectionBatch | null> {
    const record = await this.prisma.program_section_batches.findUnique({
      where: { id: BigInt(id) },
    });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async create(data: CreateBatchData): Promise<ProgramSectionBatch> {
    const record = await this.prisma.program_section_batches.create({
      data: {
        section: {
          connect: { id: BigInt(data.sectionId) },
        },
        batch_name: data.batchName,
        tutor_id: data.tutorId ? BigInt(data.tutorId) : null,
        qa_id: data.qaId ? BigInt(data.qaId) : null,
        placement_officer_id: data.placementOfficerId ? BigInt(data.placementOfficerId) : null,
        start_date: data.startDate ?? null,
        end_date: data.endDate ?? null,
        status: 'Active',
        created_by: BigInt(data.createdBy),
        updated_by: BigInt(data.updatedBy),
      },
    });
    return this.mapToDomain(record);
  }

  async update(id: number, data: UpdateBatchData): Promise<ProgramSectionBatch | null> {
    const existing = await this.prisma.program_section_batches.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) return null;

    const updateData: Prisma.program_section_batchesUpdateInput = {
      updated_by: BigInt(data.updatedBy),
    };

    if (data.batchName !== undefined) {
      updateData.batch_name = data.batchName;
    }
    if (data.tutorId !== undefined) {
      updateData.tutor_id = data.tutorId ? BigInt(data.tutorId) : null;
    }
    if (data.qaId !== undefined) {
      updateData.qa_id = data.qaId ? BigInt(data.qaId) : null;
    }
    if (data.placementOfficerId !== undefined) {
      updateData.placement_officer_id = data.placementOfficerId ? BigInt(data.placementOfficerId) : null;
    }
    if (data.startDate !== undefined) {
      updateData.start_date = data.startDate;
    }
    if (data.endDate !== undefined) {
      updateData.end_date = data.endDate;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    const record = await this.prisma.program_section_batches.update({
      where: { id: BigInt(id) },
      data: updateData,
    });
    return this.mapToDomain(record);
  }

  private mapToDomain(raw: {
    id: bigint;
    section_id: bigint;
    batch_name: string;
    tutor_id: bigint | null;
    qa_id: bigint | null;
    placement_officer_id: bigint | null;
    start_date: Date | null;
    end_date: Date | null;
    status: string;
    created_by: bigint;
    updated_by: bigint;
    created_at: Date | null;
    updated_at: Date | null;
  }): ProgramSectionBatch {
    const props: ProgramSectionBatchProps = {
      id: Number(raw.id),
      sectionId: Number(raw.section_id),
      batchName: raw.batch_name,
      tutorId: raw.tutor_id ? Number(raw.tutor_id) : null,
      qaId: raw.qa_id ? Number(raw.qa_id) : null,
      placementOfficerId: raw.placement_officer_id ? Number(raw.placement_officer_id) : null,
      startDate: raw.start_date,
      endDate: raw.end_date,
      status: raw.status,
      createdBy: Number(raw.created_by),
      updatedBy: Number(raw.updated_by),
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
    return new ProgramSectionBatch(props);
  }
}

