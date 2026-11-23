import { PrismaClient, Prisma } from '@prisma/client';
import {
  IPerformanceRepository,
  ListPerformanceFilter,
  StudentModulePerformanceResult,
  CompletedModuleItem,
} from '../../domain/repositories/IPerformanceRepository';
import { ModulePerformance } from '../../domain/entities/ModulePerformance';

export class PrismaPerformanceRepository implements IPerformanceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async savePerformance(
    studentSectionModuleId: number,
    performance: string,
    description: string | null,
    userId: number
  ): Promise<ModulePerformance | null> {
    const existing = await this.prisma.student_section_modules.findUnique({
      where: { id: BigInt(studentSectionModuleId) },
    });

    if (!existing) return null;

    const updated = await this.prisma.student_section_modules.update({
      where: { id: BigInt(studentSectionModuleId) },
      data: {
        performance,
        performance_description: description,
        performance_created_by: BigInt(userId),
        performance_created_at: new Date(),
      },
      include: {
        module: true,
        student_section: {
          include: {
            batch: {
              include: {
                section: true,
              },
            },
          },
        },
      },
    });

    const student = await this.prisma.students.findUnique({
      where: { id: updated.student_section.student_id },
    });

    return new ModulePerformance({
      studentSectionModuleId: Number(updated.id),
      studentId: Number(updated.student_section.student_id),
      studentSectionId: Number(updated.student_section_id),
      moduleId: Number(updated.module_id),
      moduleName: updated.module.name,
      modulePriority: updated.module.order,
      status: updated.status,
      performance: updated.performance,
      performanceDescription: updated.performance_description,
      performanceCreatedBy: updated.performance_created_by ? Number(updated.performance_created_by) : null,
      performanceCreatedAt: updated.performance_created_at,
      studentFirstName: student?.first_name,
      studentLastName: student?.last_name,
      studentEmail: student?.email,
      studentMobile: student?.mobile_no,
      batchId: Number(updated.student_section.batch_id),
      batchName: updated.student_section.batch.batch_name,
      sectionId: Number(updated.student_section.batch.section_id),
      sectionName: updated.student_section.batch.section.name,
      selfPlaced: updated.student_section.self_placed,
      updatedAt: updated.updated_at,
    });
  }

  async getPerformanceById(id: number): Promise<ModulePerformance | null> {
    const record = await this.prisma.student_section_modules.findUnique({
      where: { id: BigInt(id) },
      include: {
        module: true,
        student_section: {
          include: {
            batch: {
              include: {
                section: true,
              },
            },
          },
        },
      },
    });

    if (!record) return null;

    const student = await this.prisma.students.findUnique({
      where: { id: record.student_section.student_id },
    });

    return new ModulePerformance({
      studentSectionModuleId: Number(record.id),
      studentId: Number(record.student_section.student_id),
      studentSectionId: Number(record.student_section_id),
      moduleId: Number(record.module_id),
      moduleName: record.module.name,
      modulePriority: record.module.order,
      status: record.status,
      performance: record.performance,
      performanceDescription: record.performance_description,
      performanceCreatedBy: record.performance_created_by ? Number(record.performance_created_by) : null,
      performanceCreatedAt: record.performance_created_at,
      studentFirstName: student?.first_name,
      studentLastName: student?.last_name,
      studentEmail: student?.email,
      studentMobile: student?.mobile_no,
      batchId: Number(record.student_section.batch_id),
      batchName: record.student_section.batch.batch_name,
      sectionId: Number(record.student_section.batch.section_id),
      sectionName: record.student_section.batch.section.name,
      selfPlaced: record.student_section.self_placed,
      updatedAt: record.updated_at,
    });
  }

  async clearPerformance(id: number): Promise<boolean> {
    const existing = await this.prisma.student_section_modules.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) return false;

    await this.prisma.student_section_modules.update({
      where: { id: BigInt(id) },
      data: {
        performance: null,
        performance_description: null,
        performance_created_by: null,
        performance_created_at: null,
      },
    });

    return true;
  }

  async listPerformances(
    filters: ListPerformanceFilter
  ): Promise<{ items: ModulePerformance[]; isCertificate: boolean }> {
    const where: Prisma.student_section_modulesWhereInput = {};

    if (filters.studentSectionId !== undefined) {
      where.student_section_id = BigInt(filters.studentSectionId);
    } else {
      if (filters.studentId !== undefined) {
        where.student_section = {
          student_id: BigInt(filters.studentId),
        };
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
    }

    if (filters.moduleId !== undefined) {
      where.module_id = BigInt(filters.moduleId);
    }

    if (filters.performance !== undefined) {
      where.performance = filters.performance;
    }

    const totalActiveModules = await this.prisma.student_section_modules.count({
      where: {
        ...where,
        module: { status: 'Active' },
      },
    });

    const evaluatedActiveModules = await this.prisma.student_section_modules.count({
      where: {
        ...where,
        module: { status: 'Active' },
        performance_created_at: { not: null },
      },
    });

    const isCertificate = totalActiveModules > 0 && totalActiveModules === evaluatedActiveModules;

    if (filters.onlyWithPerformance) {
      where.performance = { not: null };
    }

    const records = await this.prisma.student_section_modules.findMany({
      where,
      include: {
        module: true,
        student_section: {
          include: {
            batch: {
              include: {
                section: true,
              },
            },
          },
        },
      },
      orderBy: { performance_created_at: 'desc' },
    });

    const studentIds = records.map((r) => r.student_section.student_id);
    const students = await this.prisma.students.findMany({
      where: { id: { in: studentIds } },
    });
    const studentMap = new Map<number, (typeof students)[number]>();
    students.forEach((s) => studentMap.set(Number(s.id), s));

    const items = records.map((r) => {
      const s = studentMap.get(Number(r.student_section.student_id));
      return new ModulePerformance({
        studentSectionModuleId: Number(r.id),
        studentId: Number(r.student_section.student_id),
        studentSectionId: Number(r.student_section_id),
        moduleId: Number(r.module_id),
        moduleName: r.module.name,
        modulePriority: r.module.order,
        status: r.status,
        performance: r.performance,
        performanceDescription: r.performance_description,
        performanceCreatedBy: r.performance_created_by ? Number(r.performance_created_by) : null,
        performanceCreatedAt: r.performance_created_at,
        studentFirstName: s?.first_name,
        studentLastName: s?.last_name,
        studentEmail: s?.email,
        studentMobile: s?.mobile_no,
        batchId: Number(r.student_section.batch_id),
        batchName: r.student_section.batch.batch_name,
        sectionId: Number(r.student_section.batch.section_id),
        sectionName: r.student_section.batch.section.name,
        selfPlaced: r.student_section.self_placed,
        updatedAt: r.updated_at,
      });
    });

    return { items, isCertificate };
  }

  async getStudentModulePerformance(studentId: number): Promise<StudentModulePerformanceResult | null> {
    const student = await this.prisma.students.findUnique({
      where: { id: BigInt(studentId) },
    });
    if (!student) return null;

    const lastSection = await this.prisma.student_sections.findFirst({
      where: {
        student_id: BigInt(studentId),
        status: { not: 'deleted' },
      },
      orderBy: { id: 'desc' },
      include: {
        batch: {
          include: {
            section: true,
          },
        },
      },
    });

    if (!lastSection) {
      return {
        student: {
          id: Number(student.id),
          firstName: student.first_name,
          lastName: student.last_name,
          email: student.email,
          mobileNo: student.mobile_no,
        },
        modules: [],
      };
    }

    const sectionModules = await this.prisma.modules.findMany({
      where: {
        section_id: lastSection.batch.section_id,
        status: { not: 'deleted' },
      },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    });

    const ssmRecords = await this.prisma.student_section_modules.findMany({
      where: {
        student_section_id: lastSection.id,
      },
    });

    const ssmMap = new Map<number, (typeof ssmRecords)[number]>();
    ssmRecords.forEach((item) => ssmMap.set(Number(item.module_id), item));

    const moduleDetails = sectionModules.map((m) => {
      const match = ssmMap.get(Number(m.id));
      return {
        moduleId: Number(m.id),
        moduleName: m.name,
        modulePriority: m.order,
        moduleStatus: m.status,
        sectionId: Number(lastSection.batch.section_id),
        sectionName: lastSection.batch.section.name,
        performance: match
          ? {
              studentSectionModuleId: Number(match.id),
              studentSectionId: Number(match.student_section_id),
              status: match.status,
              performance: match.performance,
              performanceDescription: match.performance_description,
              performanceCreatedBy: match.performance_created_by ? Number(match.performance_created_by) : null,
              performanceCreatedAt: match.performance_created_at ? match.performance_created_at.toISOString() : null,
            }
          : null,
      };
    });

    return {
      student: {
        id: Number(student.id),
        firstName: student.first_name,
        lastName: student.last_name,
        email: student.email,
        mobileNo: student.mobile_no,
      },
      modules: moduleDetails,
    };
  }

  async getCompletedModules(studentId: number, studentSectionId?: number): Promise<CompletedModuleItem[]> {
    const where: Prisma.student_section_modulesWhereInput = {
      status: 'completed',
      student_section: {
        student_id: BigInt(studentId),
      },
    };

    if (studentSectionId !== undefined) {
      where.student_section_id = BigInt(studentSectionId);
    }

    const records = await this.prisma.student_section_modules.findMany({
      where,
      include: {
        module: true,
        student_section: true,
      },
      orderBy: { updated_at: 'desc' },
    });

    return records.map((r) => ({
      id: Number(r.id),
      studentId: Number(r.student_section.student_id),
      studentSectionId: Number(r.student_section_id),
      moduleId: Number(r.module_id),
      moduleName: r.module.name,
      completedAt: r.updated_at ? r.updated_at.toISOString() : null,
    }));
  }
}

