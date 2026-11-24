import { PrismaClient, Prisma } from '@prisma/client';
import { ITopicRepository, CreateTopicData, UpdateTopicData } from '../../domain/repositories/ITopicRepository';
import { Topic, TopicProps } from '../../domain/entities/Topic';

export class PrismaTopicRepository implements ITopicRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(moduleId?: number | undefined, type?: string | undefined, status?: string | undefined): Promise<Topic[]> {
    const where: Prisma.topicsWhereInput = {};
    if (moduleId !== undefined) {
      where.module_id = BigInt(moduleId);
    }
    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }

    const records = await this.prisma.topics.findMany({
      where,
      include: {
        module: {
          include: {
            section: {
              include: {
                program: true,
              },
            },
          },
        },
        topic_assessments: true,
      },
      orderBy: [{ priority: 'asc' }, { order: 'asc' }, { created_at: 'desc' }],
    });
    return records.map((r) => this.mapToDomain(r));
  }

  async findById(id: number): Promise<Topic | null> {
    const record = await this.prisma.topics.findUnique({
      where: { id: BigInt(id) },
      include: {
        module: {
          include: {
            section: {
              include: {
                program: true,
              },
            },
          },
        },
        topic_assessments: true,
      },
    });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async create(data: CreateTopicData): Promise<Topic> {
    const record = await this.prisma.topics.create({
      data: {
        module: {
          connect: { id: BigInt(data.moduleId) },
        },
        name: data.name,
        description: data.description ?? null,
        type: data.type,
        cover_image: data.coverImage ?? null,
        file_url: data.fileUrl ?? null,
        day_count: data.dayCount ?? 1,
        priority: data.priority ?? 0,
        content_url: data.contentUrl ?? data.fileUrl ?? null,
        order: data.order ?? data.priority ?? 0,
        status: data.status ?? 'Active',
        created_by: BigInt(data.createdBy),
        updated_by: BigInt(data.updatedBy),
      },
      include: {
        module: {
          include: {
            section: {
              include: {
                program: true,
              },
            },
          },
        },
        topic_assessments: true,
      },
    });

    if (data.assessments && data.assessments.length > 0) {
      for (const a of data.assessments) {
        await this.prisma.topic_assessments.create({
          data: {
            topic_id: record.id,
            question: a.question,
            options: typeof a.options === 'string' ? JSON.parse(a.options) : (a.options as object),
            correct_answer: a.correctAnswer ?? (typeof a.answer === 'string' ? a.answer : JSON.stringify(a.answer ?? '')),
            marks: a.marks ?? 1,
            created_by: BigInt(data.createdBy),
            updated_by: BigInt(data.updatedBy),
          },
        });
      }
    }

    const created = await this.findById(Number(record.id));
    return created as Topic;
  }

  async update(id: number, data: UpdateTopicData): Promise<Topic | null> {
    const existing = await this.prisma.topics.findUnique({ where: { id: BigInt(id) } });
    if (!existing) return null;

    const updateData: Prisma.topicsUpdateInput = {
      updated_by: BigInt(data.updatedBy),
    };

    if (data.moduleId !== undefined) {
      updateData.module = {
        connect: { id: BigInt(data.moduleId) },
      };
    }
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.type !== undefined) {
      updateData.type = data.type;
    }
    if (data.coverImage !== undefined) {
      updateData.cover_image = data.coverImage;
    }
    if (data.fileUrl !== undefined) {
      updateData.file_url = data.fileUrl;
      updateData.content_url = data.fileUrl;
    }
    if (data.contentUrl !== undefined) {
      updateData.content_url = data.contentUrl;
    }
    if (data.dayCount !== undefined) {
      updateData.day_count = data.dayCount;
    }
    if (data.priority !== undefined) {
      updateData.priority = data.priority;
      if (data.priority !== null) {
        updateData.order = data.priority;
      }
    }
    if (data.order !== undefined) {
      updateData.order = data.order;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    await this.prisma.topics.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

    if (data.assessments && data.assessments.length > 0) {
      await this.prisma.topic_assessments.deleteMany({
        where: { topic_id: BigInt(id) },
      });
      for (const a of data.assessments) {
        await this.prisma.topic_assessments.create({
          data: {
            topic_id: BigInt(id),
            question: a.question,
            options: typeof a.options === 'string' ? JSON.parse(a.options) : (a.options as object),
            correct_answer: a.correctAnswer ?? (typeof a.answer === 'string' ? a.answer : JSON.stringify(a.answer ?? '')),
            marks: a.marks ?? 1,
            created_by: BigInt(data.updatedBy),
            updated_by: BigInt(data.updatedBy),
          },
        });
      }
    }

    return this.findById(id);
  }

  private mapToDomain(raw: {
    id: bigint;
    module_id: bigint;
    name: string;
    description: string | null;
    type: string;
    cover_image: string | null;
    file_url: string | null;
    day_count: number | null;
    priority: number | null;
    content_url: string | null;
    order: number;
    status: string;
    created_by: bigint;
    updated_by: bigint;
    created_at: Date | null;
    updated_at: Date | null;
    module?: {
      id: bigint;
      name: string;
      section?: {
        id: bigint;
        code?: string | null;
        name: string;
        program?: {
          id: bigint;
          code?: string | null;
          name: string;
        } | null | undefined;
      } | null | undefined;
    } | null | undefined;
    topic_assessments?: Array<{
      id: bigint;
      question: string;
      options: unknown;
      correct_answer: string | null;
      marks: number;
      created_by?: bigint | null;
      updated_by?: bigint | null;
      created_at?: Date | null;
      updated_at?: Date | null;
    }> | undefined;
  }): Topic {
    const props: TopicProps = {
      id: Number(raw.id),
      moduleId: Number(raw.module_id),
      name: raw.name,
      description: raw.description,
      type: raw.type,
      coverImage: raw.cover_image,
      fileUrl: raw.file_url ?? raw.content_url,
      dayCount: raw.day_count ?? 1,
      priority: raw.priority ?? raw.order ?? 0,
      contentUrl: raw.content_url ?? raw.file_url,
      order: raw.order ?? raw.priority ?? 0,
      status: raw.status,
      createdBy: Number(raw.created_by),
      updatedBy: Number(raw.updated_by),
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
      module: raw.module ? {
        id: Number(raw.module.id),
        name: raw.module.name,
        section: raw.module.section ? {
          id: Number(raw.module.section.id),
          code: raw.module.section.code ?? `SEC-${raw.module.section.id}`,
          name: raw.module.section.name,
          program: raw.module.section.program ? {
            id: Number(raw.module.section.program.id),
            code: raw.module.section.program.code ?? `PROG-${raw.module.section.program.id}`,
            name: raw.module.section.program.name,
          } : undefined,
        } : undefined,
      } : undefined,
      assessments: raw.topic_assessments ? raw.topic_assessments.map((a) => ({
        id: Number(a.id),
        question: a.question,
        options: a.options,
        answer: a.correct_answer,
        correct_answer: a.correct_answer,
        marks: a.marks,
        status: 'Active',
      })) : undefined,
    };
    return new Topic(props);
  }
}
