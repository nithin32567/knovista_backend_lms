import { PrismaClient, Prisma } from '@prisma/client';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { ValidationError } from '../../../../shared/errors/ValidationError';
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
    const studentId = BigInt(data.studentId);
    const batchId = BigInt(data.batchId);
    const creatorId = BigInt(data.createdBy);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const batch = await tx.program_section_batches.findUnique({ where: { id: batchId } });
        if (!batch) throw new NotFoundError('Selected batch does not exist');

        const student = await tx.students.findUnique({ where: { id: studentId }, select: { id: true } });
        if (!student) throw new NotFoundError('Student not found');

        const record = await tx.student_sections.create({
          data: {
            student_id: studentId,
            batch_id: batchId,
            start_date: data.startDate ?? null,
            end_date: data.endDate ?? null,
            status: 'Active',
            progress_percent: 0,
            created_by: creatorId,
            updated_by: BigInt(data.updatedBy),
          },
          include: { batch: true },
        });

        const modules = await tx.modules.findMany({
          where: { section_id: batch.section_id, status: 'Active' },
          orderBy: [{ order: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            topics: { where: { status: 'Active' }, select: { id: true } },
          },
        });

        for (const [index, module] of modules.entries()) {
          const unlocked = index === 0;
          const studentModule = await tx.student_section_modules.create({
            data: {
              student_id: studentId,
              student_section_id: record.id,
              module_id: module.id,
              status: unlocked ? 'Unlocked' : 'Locked',
            },
          });

          if (module.topics.length === 0) continue;
          await tx.student_section_module_topics.createMany({
            data: module.topics.map((topic) => ({
              student_id: studentId,
              student_section_module_id: studentModule.id,
              topic_id: topic.id,
              status: unlocked ? 'active' : 'new',
              created_by: creatorId,
            })),
          });
        }

        return this.mapToDomain(record);
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ValidationError('Student is already enrolled in this batch', {
          student_id: ['Student already assigned to this batch.'],
        });
      }
      throw error;
    }
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
    return this.prisma.$transaction(async (tx) => {
      const enrollmentId = BigInt(id);
      const existing = await tx.student_sections.findUnique({ where: { id: enrollmentId } });
      if (!existing) return false;

      const topicFilter = { student_section_module: { student_section_id: enrollmentId } };
      const topics = await tx.student_section_module_topics.findMany({
        where: topicFilter,
        select: { id: true },
      });
      if (topics.length > 0) {
        await tx.student_topic_assessment_answers.deleteMany({
          where: { student_topic_id: { in: topics.map((topic) => topic.id) } },
        });
        await tx.student_section_module_topics.deleteMany({ where: topicFilter });
      }

      await tx.student_section_modules.deleteMany({ where: { student_section_id: enrollmentId } });
      await tx.student_sections.delete({ where: { id: enrollmentId } });
      return true;
    });
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

