export interface InstitutionUserProps {
  id: number;
  roleId: number;
  roleName: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  mobileNo: string | null;
  passwordHash: string;
  status: string;
  gender: string;
  lastLoginOn: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class InstitutionUser {
  constructor(private readonly props: InstitutionUserProps) {}

  get id(): number {
    return this.props.id;
  }

  get roleId(): number {
    return this.props.roleId;
  }

  get roleName(): string {
    return this.props.roleName;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`.trim();
  }

  get username(): string {
    return this.props.username;
  }

  get email(): string {
    return this.props.email;
  }

  get mobileNo(): string | null {
    return this.props.mobileNo;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get status(): string {
    return this.props.status;
  }

  get gender(): string {
    return this.props.gender;
  }

  get lastLoginOn(): Date | null {
    return this.props.lastLoginOn;
  }

  public isEligibleForLogin(): boolean {
    return this.props.status === 'Active';
  }
}

