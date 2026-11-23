export interface StudentProps {
  id: number;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth?: Date | null;
  mobileNo: string;
  alternateMobileNo?: string | null;
  parentMobileNo?: string | null;
  parentName?: string | null;
  address?: string | null;
  location?: string | null;
  pincode?: string | null;
  state?: string | null;
  email: string;
  username: string;
  passwordHash: string;
  profilePic?: string | null;
  qualification?: string | null;
  lastLoginOn?: Date | null;
  status: string;
  loginStatus: string;
  salesPersonName?: string | null;
  salesPersonPhone?: string | null;
  paidAmount: number;
  createdBy: number;
  updatedBy: number;
  specialCategoryId?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
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

  get gender(): string {
    return this.props.gender;
  }

  get dateOfBirth(): Date | null {
    return this.props.dateOfBirth ?? null;
  }

  get mobileNo(): string {
    return this.props.mobileNo;
  }

  get alternateMobileNo(): string | null {
    return this.props.alternateMobileNo ?? null;
  }

  get parentMobileNo(): string | null {
    return this.props.parentMobileNo ?? null;
  }

  get parentName(): string | null {
    return this.props.parentName ?? null;
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

  get qualification(): string | null {
    return this.props.qualification ?? null;
  }

  get lastLoginOn(): Date | null {
    return this.props.lastLoginOn ?? null;
  }

  get status(): string {
    return this.props.status;
  }

  get loginStatus(): string {
    return this.props.loginStatus;
  }

  get salesPersonName(): string | null {
    return this.props.salesPersonName ?? null;
  }

  get salesPersonPhone(): string | null {
    return this.props.salesPersonPhone ?? null;
  }

  get paidAmount(): number {
    return this.props.paidAmount;
  }

  get createdBy(): number {
    return this.props.createdBy;
  }

  get updatedBy(): number {
    return this.props.updatedBy;
  }

  get specialCategoryId(): number | null {
    return this.props.specialCategoryId ?? null;
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
      first_name: this.firstName,
      last_name: this.lastName,
      full_name: this.fullName,
      intern_name: this.fullName,
      gender: this.gender,
      date_of_birth: this.dateOfBirth ? this.dateOfBirth.toISOString().split('T')[0] : null,
      mobile_no: this.mobileNo,
      alternate_mobile_no: this.alternateMobileNo,
      parent_mobile_no: this.parentMobileNo,
      parent_name: this.parentName,
      address: this.address,
      location: this.location,
      pincode: this.pincode,
      state: this.state,
      email: this.email,
      username: this.username,
      qualification: this.qualification,
      special_category_id: this.specialCategoryId,
      profile_pic: this.profilePic,
      sales_person_name: this.salesPersonName,
      sales_person_phone: this.salesPersonPhone,
      paid_amount: this.paidAmount,
      balance_amount: 0,
      login_status: this.loginStatus === 'active' || this.loginStatus === '1',
      status: this.status,
      blocked_reason: null,
      blocked_description: null,
      blocked_at: null,
      current_section: null,
      cv_file_path: null,
      cv_file_url: null,
      created_by: this.createdBy,
      updated_by: this.updatedBy,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
      updated_at: this.updatedAt ? this.updatedAt.toISOString() : null,
    };
  }
}

