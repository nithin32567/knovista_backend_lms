import { PrismaClient, Prisma } from '@prisma/client';
import {
  IProgressRepository,
  ListUnlockRequestsFilter,
} from '../../domain/repositories/IProgressRepository';
import { StudentTopicProgress } from '../../domain/entities/StudentTopicProgress';
import { ModuleUnlockRequest } from '../../domain/entities/ModuleUnlockRequest';

export class PrismaProgressRepository implements IProgressRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findTopicProgressById(id: number): Promise<StudentTopicProgress | null> {
    const record = await this.prisma.student_section_module_topics.findUnique({
      where: { id: BigInt(id) },
      include: { topic: true },
    });
    if (!record) return null;
    return this.mapToTopicProgress(record);
  }

  async findTopicProgressByStudentAndTopic(studentId: number, topicId: number): Promise<StudentTopicProgress | null> {
    const record = await this.prisma.student_section_module_topics.findFirst({
      where: {
        student_id: BigInt(studentId),
        topic_id: BigInt(topicId),
      },
      include: { topic: true },
    });
    if (!record) return null;
    return this.mapToTopicProgress(record);
  }

  async completeTopic(topicProgressId: number, studentId: number): Promise<StudentTopicProgress | null> {
    const owner = BigInt(studentId);
    const where = {
      id: BigInt(topicProgressId),
      student_id: owner,
      topic: { type: { not: 'mcq' }, topic_assessments: { none: { status: 'Active' } } },
      student_section_module: {
        status: { in: ['Unlocked', 'active', 'completed'] },
        student_section: { student_id: owner, status: { notIn: ['Deleted', 'deleted'] } },
      },
    } satisfies Prisma.student_section_module_topicsWhereInput;
    const updated = await this.prisma.student_section_module_topics.updateMany({
      where,
      data: { status: 'completed', topic_completed_at: new Date() },
    });
    return updated.count ? this.findTopicProgressById(topicProgressId) : null;
  }

  async getStudentSectionIdByTopicProgress(topicProgressId: number): Promise<number | null> {
    const record = await this.prisma.student_section_module_topics.findUnique({
      where: { id: BigInt(topicProgressId) },
      include: {
        student_section_module: true,
      },
    });

    if (!record || !record.student_section_module) return null;
    return Number(record.student_section_module.student_section_id);
  }

  async recalculateSectionProgress(studentSectionId: number): Promise<number> {
    const modules = await this.prisma.student_section_modules.findMany({
      where: { student_section_id: BigInt(studentSectionId) },
      select: { id: true },
    });

    if (modules.length === 0) return 0;

    const moduleIds = modules.map((m) => m.id);
    const topics = await this.prisma.student_section_module_topics.findMany({
      where: { student_section_module_id: { in: moduleIds } },
    });

    if (topics.length === 0) return 0;

    const totalTopics = topics.length;
    const completedTopics = topics.filter((t) => t.status === 'completed').length;
    const rawPercent = (completedTopics / totalTopics) * 100;
    const progressPercent = Math.min(100, Math.max(0, parseFloat(rawPercent.toFixed(2))));

    await this.prisma.student_sections.update({
      where: { id: BigInt(studentSectionId) },
      data: {
        progress_percent: new Prisma.Decimal(progressPercent.toFixed(2)),
      },
    });

    return progressPercent;
  }

  async requestModuleUnlock(
    studentId: number,
    sectionId: number,
    nextModuleId: number
  ): Promise<{ success: boolean; tutorId: number | null; studentName: string | null; moduleName: string | null }> {
    const denied = { success: false, tutorId: null, studentName: null, moduleName: null };
    const owner = BigInt(studentId);
    const studentSection = await this.prisma.$transaction(async (tx) => {
      const enrollment = await tx.student_sections.findFirst({
        where: {
          student_id: owner,
          batch: { section_id: BigInt(sectionId) },
          status: { notIn: ['Deleted', 'deleted'] },
          student_section_modules: { some: { module_id: BigInt(nextModuleId) } },
        },
        include: {
          batch: true,
          student_section_modules: {
            include: {
              module: { include: { topics: { where: { status: 'Active' }, select: { id: true } } } },
              student_section_module_topics: {
                where: { student_id: owner, status: 'completed' },
                select: { topic_id: true },
              },
            },
            orderBy: [{ module: { order: 'asc' } }, { module_id: 'asc' }],
          },
        },
        orderBy: { id: 'desc' },
      });
      if (!enrollment) return null;
      const modules = enrollment.student_section_modules;
      const index = modules.findIndex((entry) => entry.module_id === BigInt(nextModuleId));
      const target = modules[index];
      const previous = modules[index - 1];
      if (!target || target.module.section_id !== BigInt(sectionId) || !previous ||
          !['Unlocked', 'active', 'completed'].includes(previous.status)  || target.module.status !== 'Active') return null;
      const completedTopics = new Set(previous.student_section_module_topics.map((topic) => topic.topic_id));
      if (previous.module.topics.some((topic) => !completedTopics.has(topic.id))) return null;

      const requested = await tx.student_section_modules.updateMany({
        where: { id: target.id, status: 'Locked', unlock_requested: false },
        data: {
          status: 'pending',
          unlock_requested: true,
          unlock_requested_by: owner,
          unlock_requested_at: new Date(),
        },
      });
      if (!requested.count) return null;
      await tx.student_section_modules.update({
        where: { id: previous.id },
        data: { status: 'completed' },
      });
      await tx.student_section_module_topics.updateMany({
        where: { student_section_module_id: target.id, student_id: owner, status: { not: 'completed' } },
        data: { status: 'pending' },
      });
      return enrollment;
    });
    if (!studentSection) return denied;

    let tutorId: number | null = null;
    if (studentSection.batch.tutor_id) {
      tutorId = Number(studentSection.batch.tutor_id);
    }

    const studentRecord = await this.prisma.students.findUnique({
      where: { id: BigInt(studentId) },
      select: { first_name: true, last_name: true },
    });

    const moduleRecord = await this.prisma.modules.findUnique({
      where: { id: BigInt(nextModuleId) },
      select: { name: true },
    });

    const studentName = studentRecord ? `${studentRecord.first_name} ${studentRecord.last_name}`.trim() : null;
    const moduleName = moduleRecord ? moduleRecord.name : null;

    return {
      success: true,
      tutorId,
      studentName,
      moduleName,
    };
  }

  async listUnlockRequests(filters: ListUnlockRequestsFilter): Promise<{ items: ModuleUnlockRequest[]; total: number }> {
    const where: Prisma.student_section_modulesWhereInput = {
      status: 'pending',
      unlock_requested: true,
      student_section: {
        status: { notIn: ['Deleted', 'deleted'] },
        ...(filters.studentId !== undefined ? { student_id: BigInt(filters.studentId) } : {}),
        ...(filters.batchId !== undefined ? { batch_id: BigInt(filters.batchId) } : {}),
        batch: {
          ...this.batchAccess(filters.actor?.id, filters.actor?.role),
          ...(filters.sectionId !== undefined ? { section_id: BigInt(filters.sectionId) } : {}),
        },
      },
    };

    const total = await this.prisma.student_section_modules.count({ where });

    const records = await this.prisma.student_section_modules.findMany({
      where,
      skip: (filters.page - 1) * filters.perPage,
      take: filters.perPage,
      include: {
        module: true,
        student_section: {
          include: {
            batch: {
              include: {
                section: {
                  include: {
                    program: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const studentIds = records.map((r) => r.student_section.student_id);
    const students = await this.prisma.students.findMany({
      where: { id: { in: studentIds } },
    });
    const studentMap = new Map<number, (typeof students)[number]>();
    students.forEach((s) => studentMap.set(Number(s.id), s));

    const items = records.map((r) => {
      const s = studentMap.get(Number(r.student_section.student_id));
      return new ModuleUnlockRequest({
        studentSectionModuleId: Number(r.id),
        studentId: Number(r.student_section.student_id),
        studentSectionId: Number(r.student_section_id),
        moduleId: Number(r.module_id),
        moduleName: r.module.name,
        modulePriority: r.module.order,
        status: r.status,
        unlockRequested: r.unlock_requested,
        unlockRequestedBy: r.unlock_requested_by ? Number(r.unlock_requested_by) : null,
        unlockRequestedAt: r.unlock_requested_at,
        unlockedBy: r.unlocked_by ? Number(r.unlocked_by) : null,
        unlockedAt: r.unlocked_at,
        studentFirstName: s?.first_name,
        studentLastName: s?.last_name,
        studentEmail: s?.email,
        studentMobile: s?.mobile_no,
        batchId: Number(r.student_section.batch_id),
        batchName: r.student_section.batch.batch_name,
        sectionId: Number(r.student_section.batch.section_id),
        sectionName: r.student_section.batch.section.name,
        programName: r.student_section.batch.section.program.name,
      });
    });

    return { items, total };
  }

  private batchAccess(id: number | undefined, role: string | undefined): Prisma.program_section_batchesWhereInput {
    if (id && (role === 'Admin' || role === 'Team Lead')) return {};
    if (id && role === 'Tutor') return { tutor_id: BigInt(id) };
    if (id && role === 'Quality Analyst') return { qa_id: BigInt(id) };
    return { id: { in: [] } };
  }

  async approveModuleUnlock(
    studentId: number,
    studentSectionId: number,
    moduleId: number,
    approverUserId: number,
    sectionId: number,
    role?: string
  ): Promise<boolean> {
    const student = BigInt(studentId);
    const section = BigInt(sectionId);
    return this.prisma.$transaction(async (tx) => {
      const target = await tx.student_section_modules.findFirst({
        where: {
          student_section_id: BigInt(studentSectionId),
          module_id: BigInt(moduleId),
          module: { section_id: section },
          status: 'pending',
          unlock_requested: true,
          unlock_requested_by: student,
          student_section: {
            student_id: student,
            status: { notIn: ['Deleted', 'deleted'] },
            batch: { ...this.batchAccess(approverUserId, role), section_id: section },
          },
        },
        select: { id: true },
      });
      if (!target) return false;
      const updated = await tx.student_section_modules.updateMany({
        where: { id: target.id, status: 'pending', unlock_requested: true },
        data: {
          status: 'active',
          unlock_requested: false,
          unlocked_by: BigInt(approverUserId),
          unlocked_at: new Date(),
        },
      });
      if (!updated.count) return false;
      await tx.student_section_module_topics.updateMany({
        where: { student_section_module_id: target.id, student_id: student, status: 'pending' },
        data: { status: 'active' },
      });
      return true;
    });
  }

  async completeCourse(studentSectionId: number): Promise<boolean> {
    const existing = await this.prisma.student_sections.findUnique({
      where: { id: BigInt(studentSectionId) },
    });
    if (!existing) return false;

    await this.prisma.student_sections.update({
      where: { id: BigInt(studentSectionId) },
      data: {
        status: 'Completed',
        progress_percent: new Prisma.Decimal(100.0),
      },
    });

    return true;
  }

  private mapToTopicProgress(record: {
    id: bigint;
    student_id: bigint;
    student_section_module_id: bigint;
    topic_id: bigint;
    status: string;
    created_by: bigint | null;
    created_at: Date | null;
    topic_started_by: bigint | null;
    topic_started_at: Date | null;
    topic_last_accessed_at: Date | null;
    topic_completed_at: Date | null;
    topic?: { name: string; type: string } | null;
  }): StudentTopicProgress {
    return new StudentTopicProgress({
      id: Number(record.id),
      studentId: Number(record.student_id),
      studentSectionModuleId: Number(record.student_section_module_id),
      topicId: Number(record.topic_id),
      status: record.status,
      createdBy: record.created_by ? Number(record.created_by) : null,
      createdAt: record.created_at,
      topicStartedBy: record.topic_started_by ? Number(record.topic_started_by) : null,
      topicStartedAt: record.topic_started_at,
      topicLastAccessedAt: record.topic_last_accessed_at,
      topicCompletedAt: record.topic_completed_at,
      topicName: record.topic?.name,
      topicType: record.topic?.type,
    });
  }
}
