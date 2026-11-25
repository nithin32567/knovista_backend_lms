import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';

export interface LastSectionDetails {
  section_id: number | null;
  section_name: string | null;
  section_code: string | null;
  section_status: string;
  expected_start_date: string | null;
  expected_end_date: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  batch_name: string | null;
  program_name: string | null;
  total_modules: number;
  completed_modules: number;
  total_topics: number;
  completed_topics: number;
}

export interface StudentDashboardData {
  overall_progress: number;
  total_leave_taken: number;
  placement_percentage: number;
  todays_quote: string;
  information_message: string;
  last_section_details: LastSectionDetails | null;
}

function formatDateOnly(value: Date | null | undefined): string | null {
  if (!value) return null;
  return value.toISOString().split('T')[0] ?? null;
}

export class GetStudentDashboardUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(studentId: number): Promise<StudentDashboardData> {
    const student = await this.prisma.students.findUnique({
      where: { id: BigInt(studentId) },
      select: { id: true },
    });

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    const lastSection = await this.prisma.student_sections.findFirst({
      where: { student_id: BigInt(studentId), status: { not: 'deleted' } },
      orderBy: { id: 'desc' },
      include: {
        batch: {
          include: {
            section: {
              include: { program: true },
            },
          },
        },
      },
    });

    let progressPercent = 0;
    let totalModules = 0;
    let completedModules = 0;
    let totalTopics = 0;
    let completedTopics = 0;
    let lastSectionDetails: LastSectionDetails | null = null;

    if (lastSection) {
      const moduleRecords = await this.prisma.student_section_modules.findMany({
        where: {
          student_section_id: lastSection.id,
          module: { status: { not: 'deleted' } },
        },
        select: { id: true, status: true },
      });

      totalModules = moduleRecords.length;
      completedModules = moduleRecords.filter((m) => m.status.toLowerCase() === 'completed').length;

      if (moduleRecords.length > 0) {
        const moduleIds = moduleRecords.map((m) => m.id);
        const topicRecords = await this.prisma.student_section_module_topics.findMany({
          where: {
            student_section_module_id: { in: moduleIds },
            topic: { status: { not: 'deleted' } },
          },
          select: { status: true },
        });

        totalTopics = topicRecords.length;
        completedTopics = topicRecords.filter((t) => t.status.toLowerCase() === 'completed').length;
      }

      const totalItems = totalModules + totalTopics;
      const completedItems = completedModules + completedTopics;
      progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 10000) / 100 : 0;

      const batch = lastSection.batch;
      const section = batch?.section;
      const program = section?.program;

      lastSectionDetails = {
        section_id: section ? Number(section.id) : null,
        section_name: section?.name ?? null,
        section_code: section?.code ?? null,
        section_status: lastSection.status,
        expected_start_date: formatDateOnly(lastSection.start_date),
        expected_end_date: formatDateOnly(lastSection.end_date),
        actual_start_date: formatDateOnly(lastSection.start_date),
        actual_end_date: formatDateOnly(lastSection.end_date),
        batch_name: batch?.batch_name ?? null,
        program_name: program?.name ?? null,
        total_modules: totalModules,
        completed_modules: completedModules,
        total_topics: totalTopics,
        completed_topics: completedTopics,
      };
    }

    const [totalLeavesTaken, quotes] = await Promise.all([
      this.prisma.student_leaves.count({
        where: { student_id: BigInt(studentId), status: 'approved' },
      }),
      this.prisma.daily_quotes.findMany({
        where: { status: { not: 'deleted' } },
        select: { quote: true },
      }),
    ]);

    const randomIndex = quotes.length > 0 ? Math.floor(Math.random() * quotes.length) : -1;
    const randomQuote = randomIndex >= 0 ? quotes[randomIndex]?.quote : undefined;
    const todaysQuote = randomQuote ?? 'Keep going—no quote available today.';

    return {
      overall_progress: progressPercent,
      total_leave_taken: totalLeavesTaken,
      placement_percentage: 0,
      todays_quote: todaysQuote,
      information_message: '',
      last_section_details: lastSectionDetails,
    };
  }
}
