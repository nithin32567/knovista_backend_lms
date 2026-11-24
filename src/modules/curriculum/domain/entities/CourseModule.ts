export interface CourseModuleSectionInfo {
  id: number;
  code: string;
  name: string;
  program?: {
    id: number;
    code: string;
    name: string;
  } | undefined;
}

export interface CourseModuleProps {
  id: number;
  sectionId: number;
  name: string;
  description: string | null;
  order: number;
  status: string;
  createdBy: number;
  updatedBy: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  section?: CourseModuleSectionInfo | undefined;
}

export class CourseModule {
  constructor(private readonly props: CourseModuleProps) {}

  get id(): number { return this.props.id; }
  get sectionId(): number { return this.props.sectionId; }
  get name(): string { return this.props.name; }
  get description(): string | null { return this.props.description; }
  get order(): number { return this.props.order; }
  get status(): string { return this.props.status; }
  get createdBy(): number { return this.props.createdBy; }
  get updatedBy(): number { return this.props.updatedBy; }
  get createdAt(): Date | null { return this.props.createdAt; }
  get updatedAt(): Date | null { return this.props.updatedAt; }
  get section(): CourseModuleSectionInfo | undefined { return this.props.section; }

  toResponseObject() {
    return {
      id: this.id,
      section_id: this.sectionId,
      name: this.name,
      description: this.description,
      priority: this.order,
      order: this.order,
      status: this.status,
      created_by: this.createdBy,
      updated_by: this.updatedBy,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
      updated_at: this.updatedAt ? this.updatedAt.toISOString() : null,
      section: this.props.section ?? {
        id: this.sectionId,
        code: `SEC-${this.sectionId}`,
        name: '',
        program: {
          id: 0,
          code: '',
          name: '',
        },
      },
    };
  }
}
