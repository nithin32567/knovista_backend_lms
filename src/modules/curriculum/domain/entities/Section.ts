export interface SectionProps {
  id: number;
  programId: number;
  name: string;
  description: string | null;
  durationInMonths: number | null;
  status: string;
  createdBy: number;
  updatedBy: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class Section {
  constructor(private readonly props: SectionProps) {}

  get id(): number { return this.props.id; }
  get programId(): number { return this.props.programId; }
  get name(): string { return this.props.name; }
  get description(): string | null { return this.props.description; }
  get durationInMonths(): number | null { return this.props.durationInMonths; }
  get status(): string { return this.props.status; }
  get createdBy(): number { return this.props.createdBy; }
  get updatedBy(): number { return this.props.updatedBy; }
  get createdAt(): Date | null { return this.props.createdAt; }
  get updatedAt(): Date | null { return this.props.updatedAt; }

  toResponseObject() {
    return {
      id: this.id,
      program_id: this.programId,
      name: this.name,
      description: this.description,
      duration_in_months: this.durationInMonths,
      status: this.status,
      created_by: this.createdBy,
      updated_by: this.updatedBy,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
      updated_at: this.updatedAt ? this.updatedAt.toISOString() : null,
    };
  }
}

