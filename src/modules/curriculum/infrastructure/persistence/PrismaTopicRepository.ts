import { PrismaClient, Prisma } from '@prisma/client';
import { ITopicRepository, CreateTopicData, UpdateTopicData } from '../../domain/repositories/ITopicRepository';
import { Topic, TopicProps, TopicType } from '../../domain/entities/Topic';

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
      orderBy: [{ order: 'asc' }, { created_at: 'desc' }],
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
        content_url: data.contentUrl ?? null,
        order: data.order ?? 0,
        status: 'Active',
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
    return this.mapToDomain(record);
  }

  async update(id: number, data: UpdateTopicData): Promise<Topic | null> {
    const existing = await this.prisma.topics.findUnique({ where: { id: BigInt(id) } });
    if (!existing) return null;

    const updateData: Prisma.topicsUpdateInput = {
      updated_by: BigInt(data.updatedBy),
    };

    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.type !== undefined) {
      updateData.type = data.type;
    }
    if (data.contentUrl !== undefined) {
      updateData.content_url = data.contentUrl;
    }
    if (data.order !== undefined) {
      updateData.order = data.order;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    const record = await this.prisma.topics.update({
      where: { id: BigInt(id) },
      data: updateData,
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
    return this.mapToDomain(record);
  }

  private mapToDomain(raw: {
    id: bigint;
    module_id: bigint;
    name: string;
    description: string | null;
    type: string;
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
        name: string;
        program?: {
          id: bigint;
          name: string;
        } | null | undefined;
      } | null | undefined;
    } | null | undefined;
    topic_assessments?: Array<{
      id: bigint;
      question: string;
      options: unknown;
      answer: unknown;
      correct_answer: string | null;
      marks: number;
      priority: number | null;
      status: string;
    }> | undefined;
  }): Topic {
    const validTypes: TopicType[] = ['video', 'file', 'mcq', 'assignment'];
    const resolvedType: TopicType = validTypes.includes(raw.type as TopicType)
      ? (raw.type as TopicType)
      : 'video';

    const props: TopicProps = {
      id: Number(raw.id),
      moduleId: Number(raw.module_id),
      name: raw.name,
      description: raw.description,
      type: resolvedType,
      contentUrl: raw.content_url,
      order: raw.order,
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
          code: `SEC-${raw.module.section.id}`,
          name: raw.module.section.name,
          program: raw.module.section.program ? {
            id: Number(raw.module.section.program.id),
            code: `PROG-${raw.module.section.program.id}`,
            name: raw.module.section.program.name,
          } : undefined,
        } : undefined,
      } : undefined,
      assessments: raw.topic_assessments ? raw.topic_assessments.map((a) => ({
        id: Number(a.id),
        question: a.question,
        options: a.options,
        answer: a.answer,
        correct_answer: a.correct_answer,
        marks: a.marks,
        priority: a.priority ?? 1,
        status: a.status,
      })) : undefined,
    };
    return new Topic(props);
  }
}
