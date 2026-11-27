import { Prisma } from '@prisma/client';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { CONTENT_ENROLLMENT_STATUSES, CONTENT_MODULE_STATUSES } from '../../../batch/domain/repositories/IStudentCourseRepository';
import { ForbiddenError } from '../../../../shared/errors/ForbiddenError';
import { prisma } from '../../../../config/database';
import { IAssessmentRepository, SaveAssessmentAnswerInput } from '../../domain/repositories/IAssessmentRepository';
import { TopicAssessment } from '../../domain/entities/TopicAssessment';
import { StudentAssessmentAnswer } from '../../domain/entities/StudentAssessmentAnswer';

export class PrismaAssessmentRepository implements IAssessmentRepository {
  async findAssessmentsByTopicId(topicId: number, studentId?: number): Promise<TopicAssessment[]> {
    const topicKey = BigInt(topicId);
    const assessmentFilter = {
      where: { status: { in: ['Active', 'active'] } },
      orderBy: [{ priority: 'asc' }, { id: 'asc' }],
    } satisfies Prisma.topics$topic_assessmentsArgs;

    if (studentId === undefined) {
      const records = await prisma.topic_assessments.findMany({
        ...assessmentFilter,
        where: { ...assessmentFilter.where, topic_id: topicKey },
      });
      return records.map((record) => this.mapTopicAssessment(record));
    }

    const owner = BigInt(studentId);
    const topic = await prisma.topics.findFirst({
      where: {
        id: topicKey,
        status: { in: ['Active', 'active'] },
        student_section_module_topics: {
          some: {
            student_id: owner,
            status: { notIn: ['Deleted', 'deleted'] },
            student_section_module: {
              status: { in: [...CONTENT_MODULE_STATUSES] },
              module: { status: { in: ['Active', 'active'] }, topics: { some: { id: topicKey } } },
              student_section: {
                student_id: owner,
                status: { in: [...CONTENT_ENROLLMENT_STATUSES] },
                batch: { section: { status: { in: ['Active', 'active'] }, modules: { some: { topics: { some: { id: topicKey } } } } } },
              },
            },
          },
        },
      },
      select: { topic_assessments: assessmentFilter },
    });
    if (!topic) throw new NotFoundError('Topic not found');
    return topic.topic_assessments.map((record) => this.mapTopicAssessment(record));
  }

  async findAssessmentById(id: number): Promise<TopicAssessment | null> {
    const record = await prisma.topic_assessments.findUnique({
      where: { id: BigInt(id) },
    });

    if (!record) {
      return null;
    }

    return this.mapTopicAssessment({
      ...record,
      correct_answer: record.correct_answer ?? this.legacyAnswer(record.answer),
    });
  }

  async saveAssessmentAnswers(answers: SaveAssessmentAnswerInput[]): Promise<StudentAssessmentAnswer[]> {
    return prisma.$transaction(async (tx) => {
      const groups = new Map<number, SaveAssessmentAnswerInput[]>();
      for (const answer of answers) {
        const group = groups.get(answer.studentTopicId) ?? [];
        group.push(answer);
        groups.set(answer.studentTopicId, group);
      }
      for (const group of groups.values()) await this.completeAssessmentTopic(tx, group);
      const saved = await this.persistAnswers(tx, answers);
      await this.recalculateSectionProgressByStudentTopicIds(tx, [...groups.keys()]);
      return saved;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  private async completeAssessmentTopic(tx: Prisma.TransactionClient, answers: SaveAssessmentAnswerInput[]): Promise<void> {
    const first = answers[0];
    if (!first) return;
    const student = BigInt(first.studentId);
    const topicId = BigInt(first.topicId);
    const questions = await tx.topic_assessments.findMany({
      where: { topic_id: topicId, status: 'Active' },
      select: { id: true },
    });
    const submitted = new Set(answers.map((answer) => BigInt(answer.assessmentId)));
    if (answers.some((answer) => answer.studentId !== first.studentId || answer.topicId !== first.topicId) ||
        answers.length !== submitted.size || submitted.size !== questions.length ||
        questions.some((question) => !submitted.has(question.id))) {
      throw new ForbiddenError('Submit each active assessment question exactly once');
    }

    const completed = await tx.student_section_module_topics.updateMany({
      where: {
        id: BigInt(first.studentTopicId),
        student_id: student,
        topic_id: topicId,
        status: { not: 'completed' },
        topic: { status: 'Active' },
        student_section_module: {
          status: { in: ['Unlocked', 'active'] },
          student_section: { student_id: student, status: { notIn: ['Deleted', 'deleted'] } },
        },
      },
      data: { status: 'completed', topic_completed_at: new Date() },
    });
    if (completed.count !== 1) throw new ForbiddenError('Student topic is not available for assessment');
  }

  private async persistAnswers(tx: Prisma.TransactionClient, answers: SaveAssessmentAnswerInput[]): Promise<StudentAssessmentAnswer[]> {
    const results: StudentAssessmentAnswer[] = [];

    for (const ans of answers) {
      const created = await tx.student_topic_assessment_answers.create({
        data: {
          student_id: BigInt(ans.studentId),
          student_topic_id: BigInt(ans.studentTopicId),
          topic_id: BigInt(ans.topicId),
          topic_assessment_id: BigInt(ans.assessmentId),
          answer: ans.answer,
          marks: ans.marks ?? false,
        },
      });

      results.push(
        new StudentAssessmentAnswer({
          id: Number(created.id),
          studentId: Number(created.student_id),
          studentTopicId: Number(created.student_topic_id),
          topicId: Number(created.topic_id),
          topicAssessmentId: Number(created.topic_assessment_id),
          answer: created.answer,
          marks: created.marks,
          createdAt: created.created_at,
          updatedAt: created.updated_at,
        })
      );
    }

    return results;
  }

  async getStudentAssessmentAnswers(studentId: number, topicId: number): Promise<StudentAssessmentAnswer[]> {
    const records = await prisma.student_topic_assessment_answers.findMany({
      where: {
        student_id: BigInt(studentId),
        topic_id: BigInt(topicId),
      },
      include: {
        topic_assessment: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return records.map((r) => {
      let parsedAnswer: string | null = null;
      if (r.topic_assessment.answer !== null && r.topic_assessment.answer !== undefined) {
        if (typeof r.topic_assessment.answer === 'string') {
          parsedAnswer = r.topic_assessment.answer;
        } else {
          parsedAnswer = JSON.stringify(r.topic_assessment.answer);
        }
      }

      return new StudentAssessmentAnswer({
        id: Number(r.id),
        studentId: Number(r.student_id),
        studentTopicId: Number(r.student_topic_id),
        topicId: Number(r.topic_id),
        topicAssessmentId: Number(r.topic_assessment_id),
        answer: r.answer,
        marks: r.marks,
        question: r.topic_assessment.question,
        options: r.topic_assessment.options,
        correctAnswer: parsedAnswer ?? r.topic_assessment.correct_answer,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      });
    });
  }

  private async recalculateSectionProgressByStudentTopicIds(tx: Prisma.TransactionClient, studentTopicIds: number[]): Promise<void> {
    if (studentTopicIds.length === 0) return;

    const ids = studentTopicIds.map((id) => BigInt(id));
    const topics = await tx.student_section_module_topics.findMany({
      where: { id: { in: ids } },
      select: {
        student_section_module: {
          select: {
            student_section_id: true,
          },
        },
      },
    });

    const studentSectionIds = Array.from(
      new Set(
        topics
          .map((t) => t.student_section_module?.student_section_id)
          .filter((sid): sid is bigint => sid !== null && sid !== undefined)
      )
    );

    for (const sectionId of studentSectionIds) {
      const allTopics = await tx.student_section_module_topics.findMany({
        where: {
          student_section_module: {
            student_section_id: sectionId,
          },
        },
        select: {
          status: true,
        },
      });

      const total = allTopics.length;
      if (total === 0) continue;

      const completed = allTopics.filter((t) => t.status === 'completed').length;
      const progressPercentage = Math.floor((completed / total) * 100);

      const updateData: { progress_percent: number; status?: string } = {
        progress_percent: progressPercentage,
      };
      if (completed === total) {
        updateData.status = 'Completed';
      }

      await tx.student_sections.update({
        where: { id: sectionId },
        data: updateData,
      });
    }
  }

  private legacyAnswer(answer: Prisma.JsonValue): string | null {
    if (typeof answer === 'string') {
      if (!answer.trimStart().startsWith('{')) return answer;
      try {
        const parsed: unknown = JSON.parse(answer);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return answer;
        const first: unknown = Object.values(parsed)[0];
        return typeof first === 'string' ? first : answer;
      } catch {
        return answer;
      }
    }
    if (answer === null || typeof answer !== 'object' || Array.isArray(answer)) return null;
    const first = Object.values(answer)[0];
    return typeof first === 'string' ? first : null;
  }

  private mapTopicAssessment(r: {
    id: bigint;
    topic_id: bigint;
    question: string;
    options: unknown;
    answer: unknown;
    correct_answer: string | null;
    marks: number;
    priority: number | null;
    status: string;
    created_at: Date | null;
    updated_at: Date | null;
  }): TopicAssessment {
    return new TopicAssessment({
      id: Number(r.id),
      topicId: Number(r.topic_id),
      question: r.question,
      options: r.options,
      answer: r.answer,
      correctAnswer: r.correct_answer,
      marks: r.marks,
      priority: r.priority,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    });
  }
}
