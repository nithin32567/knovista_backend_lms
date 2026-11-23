export interface InstitutionRoleProps {
  id: number;
  name: string;
  status: string;
  createdBy: number;
  updatedBy: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export class InstitutionRole {
  constructor(private readonly props: InstitutionRoleProps) {}

  get id(): number {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get status(): string {
    return this.props.status;
  }

  get createdBy(): number {
    return this.props.createdBy;
  }

  get updatedBy(): number {
    return this.props.updatedBy;
  }

  get createdAt(): Date | null {
    return this.props.createdAt ?? null;
  }

  get updatedAt(): Date | null {
    return this.props.updatedAt ?? null;
  }

  toResponseObject() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      created_by: this.createdBy,
      updated_by: this.updatedBy,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
      updated_at: this.updatedAt ? this.updatedAt.toISOString() : null,
    };
  }
}

