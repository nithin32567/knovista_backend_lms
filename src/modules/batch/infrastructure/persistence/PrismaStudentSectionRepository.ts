import { PrismaClient, Prisma } from '@prisma/client';
import { IStudentSectionRepository, CreateStudentSectionData, UpdateStudentSectionData } from '../../domain/repositories/IStudentSectionRepository';
import { StudentSection, StudentSectionProps } from '../../domain/entities/StudentSection';
import { StudentSectionModule, StudentSectionModuleProps } from '../../domain/entities/StudentSectionModule';

export class PrismaStudentSectionRepository implements IStudentSectionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(batchId?: number | undefined, studentId?: number | undefined, status?: string | undefined): Promise<StudentSection[]> {
    const where: Prisma.student_sectionsWhereInput = {};
    if (batchId !== undefined) {
      where.batch_id = BigInt(batchId);
    }
    if (studentId !== undefined) {
      where.student_id = BigInt(studentId);
    }
    if (status) {
      where.status = status;
    }

    const records = await this.prisma.student_sections.findMany({
      where,
      include: {
        batch: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return records.map((r) => this.mapToDomain(r));
  }

  async findById(id: number): Promise<StudentSection | null> {
    const record = await this.prisma.student_sections.findUnique({
      where: { id: BigInt(id) },
      include: { batch: true },
    });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async findByStudentAndBatch(studentId: number, batchId: number): Promise<StudentSection | null> {
    const record = await this.prisma.student_sections.findUnique({
      where: {
        student_id_batch_id: {
          student_id: BigInt(studentId),
          batch_id: BigInt(batchId),
        },
      },
      include: { batch: true },
    });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async create(data: CreateStudentSectionData): Promise<StudentSection> {
    const record = await this.prisma.student_sections.create({
      data: {
        student_id: BigInt(data.studentId),
        batch: {
          connect: { id: BigInt(data.batchId) },
        },
        start_date: data.startDate ?? null,
        end_date: data.endDate ?? null,
        status: 'Active',
        progress_percent: 0,
        created_by: BigInt(data.createdBy),
        updated_by: BigInt(data.updatedBy),
      },
      include: { batch: true },
    });

    const batch = await this.prisma.program_section_batches.findUnique({
      where: { id: BigInt(data.batchId) },
    });

    if (batch) {
      const sectionModules = await this.prisma.modules.findMany({
        where: { section_id: batch.section_id, status: 'Active' },
        orderBy: { order: 'asc' },
      });

      for (let i = 0; i < sectionModules.length; i++) {
        const mod = sectionModules[i];
        if (mod) {
          await this.prisma.student_section_modules.create({
            data: {
              student_section_id: record.id,
              module_id: mod.id,
              status: i === 0 ? 'Unlocked' : 'Locked',
              unlock_requested: false,
            },
          });
        }
      }
    }

    return this.mapToDomain(record);
  }

  async update(id: number, data: UpdateStudentSectionData): Promise<StudentSection | null> {
    const existing = await this.prisma.student_sections.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) return null;

    const updateData: Prisma.student_sectionsUpdateInput = {
      updated_by: BigInt(data.updatedBy),
    };

    if (data.startDate !== undefined) {
      updateData.start_date = data.startDate;
    }
    if (data.endDate !== undefined) {
      updateData.end_date = data.endDate;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }
    if (data.progressPercent !== undefined) {
      updateData.progress_percent = data.progressPercent;
    }

    const record = await this.prisma.student_sections.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: { batch: true },
    });

    return this.mapToDomain(record);
  }

  async delete(id: number): Promise<boolean> {
    const existing = await this.prisma.student_sections.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) return false;

    await this.prisma.student_section_modules.deleteMany({
      where: { student_section_id: BigInt(id) },
    });

    await this.prisma.student_sections.delete({
      where: { id: BigInt(id) },
    });

    return true;
  }

  async findModules(studentSectionId: number): Promise<StudentSectionModule[]> {
    const records = await this.prisma.student_section_modules.findMany({
      where: { student_section_id: BigInt(studentSectionId) },
      include: { module: true },
    });

    return records.map((r) => {
      const props: StudentSectionModuleProps = {
        id: Number(r.id),
        studentSectionId: Number(r.student_section_id),
        moduleId: Number(r.module_id),
        status: r.status,
        unlockRequested: r.unlock_requested,
        marksScored: r.marks_scored,
        totalMarks: r.total_marks,
        percentage: r.percentage ? Number(r.percentage) : null,
        remarks: r.remarks,
        evaluatedBy: r.evaluated_by ? Number(r.evaluated_by) : null,
        evaluatedAt: r.evaluated_at,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        moduleName: r.module.name,
      };
      return new StudentSectionModule(props);
    });
  }

  async findByStudentId(studentId: number): Promise<StudentSection[]> {
    const records = await this.prisma.student_sections.findMany({
      where: { student_id: BigInt(studentId) },
      include: { batch: true },
      orderBy: { created_at: 'desc' },
    });

    return records.map((r) => this.mapToDomain(r));
  }

  private mapToDomain(raw: {
    id: bigint;
    student_id: bigint;
    batch_id: bigint;
    start_date: Date | null;
    end_date: Date | null;
    status: string;
    progress_percent: Prisma.Decimal;
    created_by: bigint;
    updated_by: bigint;
    created_at: Date | null;
    updated_at: Date | null;
    batch?: {
      batch_name: string;
    };
  }): StudentSection {
    const props: StudentSectionProps = {
      id: Number(raw.id),
      studentId: Number(raw.student_id),
      batchId: Number(raw.batch_id),
      startDate: raw.start_date,
      endDate: raw.end_date,
      status: raw.status,
      progressPercent: Number(raw.progress_percent),
      createdBy: Number(raw.created_by),
      updatedBy: Number(raw.updated_by),
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
      batchName: raw.batch?.batch_name,
    };
    return new StudentSection(props);
  }
}

