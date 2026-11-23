export interface StudentProps {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  mobileNo: string;
  passwordHash: string;
  status: string;
  gender: string;
  loginStatus: string;
  lastLoginOn: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class Student {
  constructor(private readonly props: StudentProps) {}

  get id(): number {
    return this.props.id;
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

  get mobileNo(): string {
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

  get loginStatus(): string {
    return this.props.loginStatus;
  }

  get lastLoginOn(): Date | null {
    return this.props.lastLoginOn;
  }

  get createdAt(): Date | null {
    return this.props.createdAt;
  }

  get updatedAt(): Date | null {
    return this.props.updatedAt;
  }

  public isBlocked(): boolean {
    return this.props.status === 'Blocked';
  }

  public isEligibleForLogin(): boolean {
    return (
      this.props.status !== 'Deleted' &&
      this.props.status !== 'Dropped' &&
      this.props.status !== 'Blocked'
    );
  }
}

