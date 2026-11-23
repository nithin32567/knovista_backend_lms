export interface InstitutionUserProps {
  id: number;
  roleId: number;
  roleName: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth?: Date | null;
  mobileNo?: string | null;
  address?: string | null;
  location?: string | null;
  pincode?: string | null;
  state?: string | null;
  qualification?: string | null;
  email: string;
  username: string;
  passwordHash: string;
  profilePic?: string | null;
  status: string;
  lastLoginOn?: Date | null;
  createdBy: number;
  updatedBy: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
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

  get gender(): string {
    return this.props.gender;
  }

  get dateOfBirth(): Date | null {
    return this.props.dateOfBirth ?? null;
  }

  get mobileNo(): string | null {
    return this.props.mobileNo ?? null;
  }

  get address(): string | null {
    return this.props.address ?? null;
  }

  get location(): string | null {
    return this.props.location ?? null;
  }

  get pincode(): string | null {
    return this.props.pincode ?? null;
  }

  get state(): string | null {
    return this.props.state ?? null;
  }

  get qualification(): string | null {
    return this.props.qualification ?? null;
  }

  get email(): string {
    return this.props.email;
  }

  get username(): string {
    return this.props.username;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get profilePic(): string | null {
    return this.props.profilePic ?? null;
  }

  get status(): string {
    return this.props.status;
  }

  get lastLoginOn(): Date | null {
    return this.props.lastLoginOn ?? null;
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
      role_id: this.roleId,
      role_name: this.roleName,
      first_name: this.firstName,
      last_name: this.lastName,
      full_name: this.fullName,
      gender: this.gender,
      date_of_birth: this.dateOfBirth ? this.dateOfBirth.toISOString().split('T')[0] : null,
      mobile_no: this.mobileNo,
      address: this.address,
      location: this.location,
      pincode: this.pincode,
      state: this.state,
      qualification: this.qualification,
      email: this.email,
      username: this.username,
      profile_pic: this.profilePic,
      status: this.status,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
      updated_at: this.updatedAt ? this.updatedAt.toISOString() : null,
    };
  }
}

