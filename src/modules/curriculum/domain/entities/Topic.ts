export type TopicType = 'video' | 'file' | 'mcq' | 'assignment';

export interface TopicModuleInfo {
  id: number;
  name: string;
  section?: {
    id: number;
    code: string;
    name: string;
    program?: {
      id: number;
      code: string;
      name: string;
    } | undefined;
  } | undefined;
}

export interface TopicProps {
  id: number;
  moduleId: number;
  name: string;
  description: string | null;
  type: TopicType;
  contentUrl: string | null;
  order: number;
  status: string;
  createdBy: number;
  updatedBy: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  module?: TopicModuleInfo | undefined;
  assessments?: unknown[] | undefined;
}

export class Topic {
  constructor(private readonly props: TopicProps) {}

  get id(): number { return this.props.id; }
  get moduleId(): number { return this.props.moduleId; }
  get name(): string { return this.props.name; }
  get description(): string | null { return this.props.description; }
  get type(): TopicType { return this.props.type; }
  get contentUrl(): string | null { return this.props.contentUrl; }
  get order(): number { return this.props.order; }
  get status(): string { return this.props.status; }
  get createdBy(): number { return this.props.createdBy; }
  get updatedBy(): number { return this.props.updatedBy; }
  get createdAt(): Date | null { return this.props.createdAt; }
  get updatedAt(): Date | null { return this.props.updatedAt; }
  get module(): TopicModuleInfo | undefined { return this.props.module; }
  get assessments(): unknown[] | undefined { return this.props.assessments; }

  toResponseObject() {
    const sectionInfo = this.props.module?.section;
    const programInfo = sectionInfo?.program;

    return {
      id: this.id,
      module_id: this.moduleId,
      name: this.name,
      description: this.description,
      type: this.type,
      file_url: this.contentUrl,
      content_url: this.contentUrl,
      cover_image: null,
      priority: this.order,
      order: this.order,
      status: this.status,
      created_by: this.createdBy,
      updated_by: this.updatedBy,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
      updated_at: this.updatedAt ? this.updatedAt.toISOString() : null,
      topic_assessments: this.props.assessments ?? [],
      questions: this.props.assessments ?? [],
      module: this.props.module ? {
        id: this.props.module.id,
        name: this.props.module.name,
        section: sectionInfo ? {
          id: sectionInfo.id,
          code: sectionInfo.code,
          name: sectionInfo.name,
          program: programInfo ? {
            id: programInfo.id,
            code: programInfo.code,
            name: programInfo.name,
          } : {
            id: 0,
            code: '',
            name: '',
          },
        } : undefined,
      } : {
        id: this.moduleId,
        name: '',
      },
      section: sectionInfo ? {
        id: sectionInfo.id,
        code: sectionInfo.code,
        name: sectionInfo.name,
      } : {
        id: 0,
        code: '',
        name: '',
      },
      program: programInfo ? {
        id: programInfo.id,
        code: programInfo.code,
        name: programInfo.name,
      } : {
        id: 0,
        code: '',
        name: '',
      },
    };
  }
}
