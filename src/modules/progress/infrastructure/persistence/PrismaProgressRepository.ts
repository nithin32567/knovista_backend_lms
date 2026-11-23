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

  async completeTopic(topicProgressId: number, _studentId: number): Promise<StudentTopicProgress | null> {
    const existing = await this.prisma.student_section_module_topics.findUnique({
      where: { id: BigInt(topicProgressId) },
    });
    if (!existing) return null;

    const updated = await this.prisma.student_section_module_topics.update({
      where: { id: BigInt(topicProgressId) },
      data: {
        status: 'completed',
        topic_completed_at: new Date(),
      },
      include: { topic: true },
    });

    return this.mapToTopicProgress(updated);
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
    const studentSection = await this.prisma.student_sections.findFirst({
      where: {
        student_id: BigInt(studentId),
        batch: {
          section_id: BigInt(sectionId),
        },
        status: { not: 'deleted' },
      },
      include: {
        batch: true,
      },
    });

    if (!studentSection) {
      return { success: false, tutorId: null, studentName: null, moduleName: null };
    }

    const ssm = await this.prisma.student_section_modules.findFirst({
      where: {
        student_section_id: studentSection.id,
        module_id: BigInt(nextModuleId),
      },
    });

    if (!ssm) {
      return { success: false, tutorId: null, studentName: null, moduleName: null };
    }

    await this.prisma.student_section_modules.update({
      where: { id: ssm.id },
      data: {
        status: 'pending',
        unlock_requested: true,
        unlock_requested_by: BigInt(studentId),
        unlock_requested_at: new Date(),
      },
    });

    await this.prisma.student_section_module_topics.updateMany({
      where: {
        student_section_module_id: ssm.id,
      },
      data: {
        status: 'pending',
      },
    });

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
      student_section: {
        status: { not: 'deleted' },
      },
    };

    if (filters.studentId !== undefined) {
      where.student_id = BigInt(filters.studentId);
    }

    if (filters.batchId !== undefined) {
      where.student_section = {
        batch_id: BigInt(filters.batchId),
      };
    }

    if (filters.sectionId !== undefined) {
      where.student_section = {
        batch: {
          section_id: BigInt(filters.sectionId),
        },
      };
    }

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

  async approveModuleUnlock(
    studentId: number,
    studentSectionId: number,
    moduleId: number,
    approverUserId: number
  ): Promise<boolean> {
    const ssm = await this.prisma.student_section_modules.findFirst({
      where: {
        student_section_id: BigInt(studentSectionId),
        module_id: BigInt(moduleId),
      },
      include: {
        module: true,
      },
    });

    if (!ssm) return false;

    await this.prisma.student_section_modules.update({
      where: { id: ssm.id },
      data: {
        status: 'active',
        unlocked_by: BigInt(approverUserId),
        unlocked_at: new Date(),
      },
    });

    await this.prisma.student_section_module_topics.updateMany({
      where: {
        student_section_module_id: ssm.id,
      },
      data: {
        status: 'active',
      },
    });

    const currentOrder = ssm.module.order;
    const previousSsm = await this.prisma.student_section_modules.findFirst({
      where: {
        student_section_id: BigInt(studentSectionId),
        module: {
          order: { lt: currentOrder },
        },
      },
      orderBy: {
        module: {
          order: 'desc',
        },
      },
    });

    if (previousSsm) {
      await this.prisma.student_section_modules.update({
        where: { id: previousSsm.id },
        data: {
          status: 'completed',
        },
      });

      await this.prisma.student_section_module_topics.updateMany({
        where: {
          student_section_module_id: previousSsm.id,
        },
        data: {
          status: 'completed',
        },
      });
    }

    return true;
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
