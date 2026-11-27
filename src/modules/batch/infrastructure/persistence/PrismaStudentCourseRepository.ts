import { Prisma, PrismaClient } from '@prisma/client';
import {
  CONTENT_ENROLLMENT_STATUSES,
  CONTENT_MODULE_STATUSES,
  IStudentCourseRepository,
  StudentCourseDetails,
  StudentCourseSummary,
} from '../../domain/repositories/IStudentCourseRepository';

const enrollmentInclude = { batch: { include: { section: true } } } satisfies Prisma.student_sectionsInclude;
type CourseEnrollment = Prisma.student_sectionsGetPayload<{ include: typeof enrollmentInclude }>;

const topicTypes: Readonly<Record<string, string>> = {
  video: 'Video',
  file: 'File',
  mcq: 'MCQ',
  assignment: 'Assignment',
};

function legacyModuleStatus(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === 'unlocked') return 'active';
  if (normalized === 'locked') return 'new';
  return normalized;
}

export class PrismaStudentCourseRepository implements IStudentCourseRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly publicUrl: string,
  ) {}

  async listByStudent(studentId: number): Promise<StudentCourseSummary[]> {
    const enrollments = await this.prisma.student_sections.findMany({
      where: { student_id: BigInt(studentId), status: { notIn: ['Deleted', 'deleted'] } },
      include: enrollmentInclude,
      orderBy: { id: 'desc' },
    });
    return enrollments.map((enrollment) => {
      const section = enrollment.batch.section;
      return {
        ...this.enrollmentFields(enrollment),
        section_id: Number(section.id),
        section_code: section.code,
        section_name: section.name,
        section_duration: section.duration_in_months ?? section.duration,
        section_amount: section.amount?.toString() ?? null,
        section_status: section.status,
        cover_image: this.mediaUrl(section.cover_image),
      };
    });
  }

  async findByStudentAndSection(studentId: number, sectionId: number): Promise<StudentCourseDetails | null> {
    const owner = BigInt(studentId);
    const sectionKey = BigInt(sectionId);
    const enrollment = await this.prisma.student_sections.findFirst({
      where: {
        student_id: owner,
        batch: { section_id: sectionKey },
        status: { notIn: ['Deleted', 'deleted'] },
      },
      orderBy: { id: 'desc' },
      include: {
        ...enrollmentInclude,
        student_section_modules: {
          where: {
            status: { notIn: ['Deleted', 'deleted'] },
            module: { section_id: sectionKey, status: { in: ['Active', 'active'] } },
          },
          orderBy: [{ module: { order: 'asc' } }, { module_id: 'asc' }],
          include: {
            module: true,
            student_section_module_topics: {
              where: {
                student_id: owner,
                status: { notIn: ['Deleted', 'deleted'] },
                topic: { status: { in: ['Active', 'active'] } },
              },
              orderBy: [{ topic: { priority: 'asc' } }, { topic_id: 'asc' }, { id: 'asc' }],
              include: {
                topic: {
                  include: {
                    topic_assessments: {
                      where: { status: { in: ['Active', 'active'] } },
                      orderBy: [{ priority: 'asc' }, { id: 'asc' }],
                      select: { id: true, question: true, options: true, priority: true, status: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!enrollment) return null;

    const section = enrollment.batch.section;
    const courseIsAccessible = section.status.toLowerCase() === 'active'
      && CONTENT_ENROLLMENT_STATUSES.some((status) => status === enrollment.status);
    return {
      section: {
        ...this.enrollmentFields(enrollment),
        code: section.code,
        name: section.name,
        duration: section.duration_in_months ?? section.duration,
        amount: section.amount?.toString() ?? null,
        status: section.status,
      },
      modules: enrollment.student_section_modules.map((assignment) => {
        const moduleStatus = legacyModuleStatus(assignment.status);
        const canRead = courseIsAccessible && CONTENT_MODULE_STATUSES.some((status) => status === assignment.status);
        return {
          module_id: Number(assignment.module_id),
          name: assignment.module.name,
          priority: assignment.module.order,
          status: assignment.module.status,
          student_module_status: moduleStatus,
          unlock_requested_at: assignment.unlock_requested_at,
          unlocked_at: assignment.unlocked_at,
          topics: assignment.student_section_module_topics
            .filter(({ topic }) => topic.module_id === assignment.module_id)
            .map((progress) => {
              const topic = progress.topic;
              return {
                student_topic_id: Number(progress.id),
                topic_id: Number(topic.id),
                name: topic.name,
                type: topicTypes[topic.type.toLowerCase()] ?? topic.type,
                file_url: canRead ? this.mediaUrl(topic.file_url ?? topic.content_url) : null,
                day_count: topic.day_count,
                cover_image: canRead ? this.mediaUrl(topic.cover_image) : null,
                priority: topic.priority ?? topic.order,
                status: topic.status,
                student_topic_status: progress.status.toLowerCase(),
                topic_started_at: progress.topic_started_at,
                topic_last_accessed_at: progress.topic_last_accessed_at,
                topic_completed_at: progress.topic_completed_at,
                assessments: canRead && topic.type.toLowerCase() === 'mcq' ? topic.topic_assessments.map((question) => ({
                  id: Number(question.id),
                  question: question.question,
                  options: typeof question.options === 'string' ? question.options : JSON.stringify(question.options),
                  priority: question.priority ?? 0,
                  status: question.status,
                })) : [],
              };
            }),
        };
      }),
    };
  }

  private mediaUrl(path: string | null): string | null {
    if (!path) return null;
    const storagePath = path.match(/^(?:public\/|\/?storage\/)?((?:sections|topics)\/.+)$/)?.[1];
    return storagePath ? `${this.publicUrl.replace(/\/$/, '')}/storage/${storagePath}` : path;
  }

  private enrollmentFields(enrollment: CourseEnrollment) {
    const batch = enrollment.batch;
    return {
      expected_start_date: enrollment.start_date ?? batch.start_date,
      expected_end_date: enrollment.end_date ?? batch.end_date,
      actual_start_date: null,
      actual_end_date: null,
      student_section_status: enrollment.status.toLowerCase(),
      batch: {
        id: Number(batch.id),
        section_id: Number(batch.section_id),
        program_id: Number(batch.section.program_id),
        name: batch.batch_name,
        tutor_id: batch.tutor_id === null ? null : Number(batch.tutor_id),
        quality_analyst_id: batch.qa_id === null ? null : Number(batch.qa_id),
        placement_officer_id: batch.placement_officer_id === null ? null : Number(batch.placement_officer_id),
        batch_start_date: batch.start_date,
        batch_end_date: batch.end_date,
        status: batch.status,
        created_by: Number(batch.created_by),
        updated_by: Number(batch.updated_by),
        created_at: batch.created_at,
        updated_at: batch.updated_at,
      },
    };
  }
}
