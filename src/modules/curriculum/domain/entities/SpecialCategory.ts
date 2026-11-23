export interface SpecialCategoryProps {
  id: number;
  name: string;
  description: string | null;
  status: string;
  createdBy: number;
  updatedBy: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class SpecialCategory {
  constructor(private readonly props: SpecialCategoryProps) {}

  get id(): number { return this.props.id; }
  get name(): string { return this.props.name; }
  get description(): string | null { return this.props.description; }
  get status(): string { return this.props.status; }
  get createdBy(): number { return this.props.createdBy; }
  get updatedBy(): number { return this.props.updatedBy; }
  get createdAt(): Date | null { return this.props.createdAt; }
  get updatedAt(): Date | null { return this.props.updatedAt; }

  toResponseObject() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      status: this.status,
      created_by: this.createdBy,
      updated_by: this.updatedBy,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
      updated_at: this.updatedAt ? this.updatedAt.toISOString() : null,
    };
  }
}

