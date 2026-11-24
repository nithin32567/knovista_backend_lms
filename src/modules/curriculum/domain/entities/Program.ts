export interface ProgramProps {
  id: number;
  code?: string | null | undefined;
  name: string;
  description: string | null;
  language?: string | undefined;
  icon?: string | null | undefined;
  coverImage?: string | null | undefined;
  status: string;
  createdBy: number;
  updatedBy: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class Program {
  constructor(private readonly props: ProgramProps) {}

  get id(): number { return this.props.id; }
  get code(): string | null { return this.props.code ?? null; }
  get name(): string { return this.props.name; }
  get description(): string | null { return this.props.description; }
  get language(): string { return this.props.language ?? 'English'; }
  get icon(): string | null { return this.props.icon ?? null; }
  get coverImage(): string | null { return this.props.coverImage ?? null; }
  get status(): string { return this.props.status; }
  get createdBy(): number { return this.props.createdBy; }
  get updatedBy(): number { return this.props.updatedBy; }
  get createdAt(): Date | null { return this.props.createdAt; }
  get updatedAt(): Date | null { return this.props.updatedAt; }

  toResponseObject() {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      description: this.description,
      language: this.language,
      icon: this.icon,
      cover_image: this.coverImage,
      status: this.status,
      created_by: this.createdBy,
      updated_by: this.updatedBy,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
      updated_at: this.updatedAt ? this.updatedAt.toISOString() : null,
    };
  }
}
