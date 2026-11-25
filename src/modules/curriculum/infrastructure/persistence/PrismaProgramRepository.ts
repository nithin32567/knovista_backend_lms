import { PrismaClient, Prisma } from '@prisma/client';
import {
  IProgramRepository,
  CreateProgramData,
  UpdateProgramData,
  ProgramFilter,
} from '../../domain/repositories/IProgramRepository';
import { Program, ProgramProps } from '../../domain/entities/Program';

export class PrismaProgramRepository implements IProgramRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(filter?: ProgramFilter | string | undefined): Promise<Program[]> {
    const where: Prisma.programsWhereInput = {};
    if (typeof filter === 'string') {
      where.status = filter;
    } else if (filter) {
      if (filter.status) {
        where.status = filter.status;
      } else {
        where.status = { not: 'Deleted' };
      }
      if (filter.language) where.language = filter.language;
      if (filter.code) where.code = { contains: filter.code };
      if (filter.name) where.name = { contains: filter.name };
    } else {
      where.status = { not: 'Deleted' };
    }

    const records = await this.prisma.programs.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
    return records.map((r) => this.mapToDomain(r));
  }

  async findById(id: number): Promise<Program | null> {
    const record = await this.prisma.programs.findUnique({ where: { id: BigInt(id) } });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async create(data: CreateProgramData): Promise<Program> {
    const record = await this.prisma.programs.create({
      data: {
        code: data.code ?? null,
        name: data.name,
        description: data.description ?? null,
        language: data.language ?? 'English',
        icon: data.icon ?? null,
        cover_image: data.coverImage ?? null,
        status: data.status ?? 'Active',
        created_by: BigInt(data.createdBy),
        updated_by: BigInt(data.updatedBy),
      },
    });
    return this.mapToDomain(record);
  }

  async update(id: number, data: UpdateProgramData): Promise<Program | null> {
    const existing = await this.prisma.programs.findUnique({ where: { id: BigInt(id) } });
    if (!existing) return null;

    const updateData: Prisma.programsUpdateInput = {
      updated_by: BigInt(data.updatedBy),
    };

    if (data.code !== undefined) {
      updateData.code = data.code;
    }
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.language !== undefined) {
      updateData.language = data.language;
    }
    if (data.icon !== undefined) {
      updateData.icon = data.icon;
    }
    if (data.coverImage !== undefined) {
      updateData.cover_image = data.coverImage;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    const record = await this.prisma.programs.update({
      where: { id: BigInt(id) },
      data: updateData,
    });
    return this.mapToDomain(record);
  }

  async delete(id: number, updaterId: number): Promise<boolean> {
    const existing = await this.prisma.programs.findUnique({ where: { id: BigInt(id) } });
    if (!existing) return false;

    await this.prisma.programs.update({
      where: { id: BigInt(id) },
      data: {
        status: 'Deleted',
        updated_by: BigInt(updaterId),
      },
    });
    return true;
  }

  async clone(sourceProgramId: number, creatorId: number): Promise<number> {
    const source = await this.prisma.programs.findUnique({
      where: { id: BigInt(sourceProgramId) },
      include: {
        sections: {
          where: { status: { not: 'Deleted' } },
          include: {
            modules: {
              where: { status: { not: 'Deleted' } },
              include: {
                topics: {
                  where: { status: { not: 'Deleted' } },
                  include: {
                    topic_assessments: {
                      where: { status: { not: 'Deleted' } },
                      orderBy: [{ priority: 'asc' }, { id: 'asc' }],
                    },
                  },
                  orderBy: [{ priority: 'asc' }, { id: 'asc' }],
                },
              },
              orderBy: [{ order: 'asc' }, { id: 'asc' }],
            },
          },
          orderBy: [{ priority: 'asc' }, { id: 'asc' }],
        },
      },
    });

    if (!source) {
      throw new Error('Program not found');
    }

    let candidateProgramCode: string | null = null;
    if (source.code) {
      candidateProgramCode = `${source.code}_copy`;
      let counter = 1;
      while (await this.prisma.programs.findUnique({ where: { code: candidateProgramCode } })) {
        candidateProgramCode = `${source.code}_${counter}`;
        counter++;
      }
    }

    const createdProgramId = await this.prisma.$transaction(async (tx) => {
      const newProgram = await tx.programs.create({
        data: {
          code: candidateProgramCode,
          name: `${source.name}_copy`,
          description: source.description,
          language: source.language,
          icon: source.icon,
          cover_image: source.cover_image,
          status: source.status,
          created_by: BigInt(creatorId),
          updated_by: BigInt(creatorId),
        },
      });

      for (const section of source.sections) {
        let candidateSectionCode: string | null = null;
        if (section.code) {
          candidateSectionCode = `${section.code}_copy`;
          let sectionCounter = 1;
          while (await tx.sections.findUnique({ where: { code: candidateSectionCode } })) {
            candidateSectionCode = `${section.code}_${sectionCounter}`;
            sectionCounter++;
          }
        }

        const newSection = await tx.sections.create({
          data: {
            program_id: newProgram.id,
            code: candidateSectionCode,
            name: section.name,
            description: section.description,
            icon: section.icon,
            cover_image: section.cover_image,
            duration: section.duration,
            duration_in_months: section.duration_in_months,
            amount: section.amount,
            priority: section.priority,
            status: section.status,
            is_demo: section.is_demo,
            created_by: BigInt(creatorId),
            updated_by: BigInt(creatorId),
          },
        });

        for (const module of section.modules) {
          const newModule = await tx.modules.create({
            data: {
              section_id: newSection.id,
              name: module.name,
              description: module.description,
              order: module.order,
              status: module.status,
              created_by: BigInt(creatorId),
              updated_by: BigInt(creatorId),
            },
          });

          for (const topic of module.topics) {
            const newTopic = await tx.topics.create({
              data: {
                module_id: newModule.id,
                name: topic.name,
                description: topic.description,
                type: topic.type,
                cover_image: topic.cover_image,
                file_url: topic.file_url,
                content_url: topic.content_url,
                day_count: topic.day_count,
                priority: topic.priority,
                order: topic.order,
                status: topic.status,
                created_by: BigInt(creatorId),
                updated_by: BigInt(creatorId),
              },
            });

            for (const assessment of topic.topic_assessments) {
              await tx.topic_assessments.create({
                data: {
                  topic_id: newTopic.id,
                  question: assessment.question,
                  options: assessment.options as object,
                  answer: assessment.answer as object,
                  correct_answer: assessment.correct_answer,
                  marks: assessment.marks,
                  priority: assessment.priority,
                  status: assessment.status,
                  created_by: BigInt(creatorId),
                  updated_by: BigInt(creatorId),
                },
              });
            }
          }
        }
      }

      return Number(newProgram.id);
    });

    return createdProgramId;
  }

  private mapToDomain(raw: {
    id: bigint;
    code: string | null;
    name: string;
    description: string | null;
    language: string;
    icon: string | null;
    cover_image: string | null;
    status: string;
    created_by: bigint;
    updated_by: bigint;
    created_at: Date | null;
    updated_at: Date | null;
  }): Program {
    const props: ProgramProps = {
      id: Number(raw.id),
      code: raw.code,
      name: raw.name,
      description: raw.description,
      language: raw.language,
      icon: raw.icon,
      coverImage: raw.cover_image,
      status: raw.status,
      createdBy: Number(raw.created_by),
      updatedBy: Number(raw.updated_by),
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
    return new Program(props);
  }
}
