export type TopicType = 'video' | 'file' | 'mcq' | 'assignment';

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

  toResponseObject() {
    return {
      id: this.id,
      module_id: this.moduleId,
      name: this.name,
      description: this.description,
      type: this.type,
      content_url: this.contentUrl,
      order: this.order,
      status: this.status,
      created_by: this.createdBy,
      updated_by: this.updatedBy,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
      updated_at: this.updatedAt ? this.updatedAt.toISOString() : null,
    };
  }
}

