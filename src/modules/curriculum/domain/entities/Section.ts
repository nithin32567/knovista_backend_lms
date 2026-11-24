export interface SectionProgramInfo {
  id: number;
  code: string;
  name: string;
}

export interface SectionProps {
  id: number;
  programId: number;
  code?: string | null | undefined;
  name: string;
  icon?: string | null | undefined;
  coverImage?: string | null | undefined;
  duration?: string | null | undefined;
  amount?: number | null | undefined;
  priority?: number | null | undefined;
  description: string | null;
  durationInMonths: number | null;
  status: string;
  isDemo?: boolean | undefined;
  createdBy: number;
  updatedBy: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  program?: SectionProgramInfo | undefined;
}

export class Section {
  constructor(private readonly props: SectionProps) {}

  get id(): number { return this.props.id; }
  get programId(): number { return this.props.programId; }
  get code(): string | null | undefined { return this.props.code; }
  get name(): string { return this.props.name; }
  get icon(): string | null | undefined { return this.props.icon; }
  get coverImage(): string | null | undefined { return this.props.coverImage; }
  get duration(): string | null | undefined { return this.props.duration; }
  get amount(): number | null | undefined { return this.props.amount; }
  get priority(): number | null | undefined { return this.props.priority; }
  get description(): string | null { return this.props.description; }
  get durationInMonths(): number | null { return this.props.durationInMonths; }
  get status(): string { return this.props.status; }
  get isDemo(): boolean | undefined { return this.props.isDemo; }
  get createdBy(): number { return this.props.createdBy; }
  get updatedBy(): number { return this.props.updatedBy; }
  get createdAt(): Date | null { return this.props.createdAt; }
  get updatedAt(): Date | null { return this.props.updatedAt; }
  get program(): SectionProgramInfo | undefined { return this.props.program; }

  toResponseObject() {
    return {
      id: this.id,
      code: this.code ?? `SEC-${this.id}`,
      program_id: this.programId,
      name: this.name,
      description: this.description,
      duration: this.duration ?? (this.durationInMonths ? String(this.durationInMonths) : null),
      duration_in_months: this.durationInMonths ?? (this.duration ? parseInt(this.duration, 10) || null : null),
      amount: this.amount ?? 0,
      priority: this.priority ?? 0,
      is_demo: this.isDemo ?? false,
      icon: this.icon ?? null,
      cover_image: this.coverImage ?? null,
      status: this.status,
      created_by: this.createdBy,
      updated_by: this.updatedBy,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
      updated_at: this.updatedAt ? this.updatedAt.toISOString() : null,
      program: this.props.program ?? {
        id: this.programId,
        code: `PROG-${this.programId}`,
        name: '',
      },
    };
  }
}
