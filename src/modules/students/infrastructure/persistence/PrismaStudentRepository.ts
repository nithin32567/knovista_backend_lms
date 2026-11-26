import { PrismaClient, Prisma } from '@prisma/client';
import { IStudentRepository, StudentFilterParams, CreateStudentParams, UpdateStudentParams, BlockStudentParams, DropStudentParams } from '../../domain/repositories/IStudentRepository';
import { Student, StudentProps } from '../../domain/entities/Student';
import { StudentBlockReason } from '../../domain/entities/StudentBlockReason';

export class PrismaStudentRepository implements IStudentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(filters: StudentFilterParams): Promise<{ students: Student[]; total: number }> {
    const { page, perPage, keyword, status, location, loginStatus, creatorId } = filters;

    const where: Prisma.studentsWhereInput = {
      status: { not: 'Deleted' },
    };

    if (filters.allowedStudentIds) {
      where.id = { in: filters.allowedStudentIds.map((id) => BigInt(id)) };
    }

    if (creatorId !== undefined) {
      where.created_by = BigInt(creatorId);
    }

    if (status && status !== '') {
      where.status = status;
    }

    if (location && location !== '') {
      where.location = { contains: location };
    }

    if (loginStatus && loginStatus !== '') {
      const isOnline = loginStatus === 'true' || loginStatus === '1';
      where.login_status = isOnline ? 'active' : 'inactive';
    }

    if (keyword && keyword.trim() !== '') {
      const term = keyword.trim();
      where.OR = [
        { first_name: { contains: term } },
        { last_name: { contains: term } },
        { email: { contains: term } },
        { username: { contains: term } },
        { mobile_no: { contains: term } },
      ];
    }

    const skip = (page - 1) * perPage;
    const take = perPage;

    const [records, total] = await Promise.all([
      this.prisma.students.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.students.count({ where }),
    ]);

    const students = records.map((r) => this.mapToDomain(r));
    return { students, total };
  }

  async findById(id: number): Promise<Student | null> {
    const record = await this.prisma.students.findUnique({
      where: { id: BigInt(id) },
    });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async findByEmail(email: string): Promise<Student | null> {
    const record = await this.prisma.students.findUnique({
      where: { email },
    });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async findByUsername(username: string): Promise<Student | null> {
    const record = await this.prisma.students.findUnique({
      where: { username },
    });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async findByMobile(mobileNo: string): Promise<Student | null> {
    const record = await this.prisma.students.findFirst({
      where: { mobile_no: mobileNo },
    });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async updatePassword(id: number, passwordHash: string, updatedBy?: number | undefined): Promise<void> {
    const data: Prisma.studentsUpdateInput = { password: passwordHash };
    if (updatedBy !== undefined) {
      data.updated_by = BigInt(updatedBy);
    }
    await this.prisma.students.update({
      where: { id: BigInt(id) },
      data,
    });
  }

  async create(data: CreateStudentParams): Promise<Student> {
    const record = await this.prisma.students.create({
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        gender: data.gender,
        date_of_birth: data.dateOfBirth ?? null,
        mobile_no: data.mobileNo,
        alternate_mobile_no: data.alternateMobileNo ?? null,
        parent_mobile_no: data.parentMobileNo ?? null,
        parent_name: data.parentName ?? null,
        address: data.address ?? null,
        location: data.location ?? null,
        pincode: data.pincode ?? null,
        state: data.state ?? null,
        email: data.email,
        username: data.username,
        password: data.passwordHash,
        qualification: data.qualification ?? null,
        special_category_id: data.specialCategoryId ? BigInt(data.specialCategoryId) : null,
        sales_person_name: data.salesPersonName ?? null,
        sales_person_phone: data.salesPersonPhone ?? null,
        paid_amount: data.paidAmount ?? 0,
        status: 'Active',
        login_status: 'inactive',
        created_by: BigInt(data.createdBy),
        updated_by: BigInt(data.updatedBy),
      },
    });

    return this.mapToDomain(record);
  }

  async update(id: number, data: UpdateStudentParams): Promise<Student> {
    const updateData: Prisma.studentsUpdateInput = {
      updated_by: BigInt(data.updatedBy),
    };

    if (data.firstName !== undefined) updateData.first_name = data.firstName;
    if (data.lastName !== undefined) updateData.last_name = data.lastName;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.dateOfBirth !== undefined) updateData.date_of_birth = data.dateOfBirth;
    if (data.mobileNo !== undefined) updateData.mobile_no = data.mobileNo;
    if (data.alternateMobileNo !== undefined) updateData.alternate_mobile_no = data.alternateMobileNo;
    if (data.parentMobileNo !== undefined) updateData.parent_mobile_no = data.parentMobileNo;
    if (data.parentName !== undefined) updateData.parent_name = data.parentName;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.pincode !== undefined) updateData.pincode = data.pincode;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.qualification !== undefined) updateData.qualification = data.qualification;
    if (data.specialCategoryId !== undefined) {
      updateData.special_category_id = data.specialCategoryId ? BigInt(data.specialCategoryId) : null;
    }
    if (data.salesPersonName !== undefined) updateData.sales_person_name = data.salesPersonName;
    if (data.salesPersonPhone !== undefined) updateData.sales_person_phone = data.salesPersonPhone;
    if (data.paidAmount !== undefined) updateData.paid_amount = data.paidAmount;

    const record = await this.prisma.students.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

    return this.mapToDomain(record);
  }

  async updateProfilePic(id: number, profilePicPath: string, updatedBy: number): Promise<void> {
    await this.prisma.students.update({
      where: { id: BigInt(id) },
      data: { profile_pic: profilePicPath, updated_by: BigInt(updatedBy) },
    });
  }

  async updateStatus(id: number, status: string, updatedBy: number): Promise<void> {
    await this.prisma.students.update({
      where: { id: BigInt(id) },
      data: { status, updated_by: BigInt(updatedBy) },
    });
  }

  async updateLoginStatus(id: number, loginStatus: string): Promise<void> {
    await this.prisma.students.update({
      where: { id: BigInt(id) },
      data: { login_status: loginStatus, login_status_updated_at: new Date() },
    });
  }

  async blockStudent(params: BlockStudentParams): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.students.update({
        where: { id: BigInt(params.studentId) },
        data: { status: 'Blocked', updated_by: BigInt(params.blockedBy) },
      }),
      this.prisma.student_block_histories.create({
        data: {
          student_id: BigInt(params.studentId),
          reason_id: BigInt(params.reasonId),
          description: params.description ?? null,
          blocked_by: BigInt(params.blockedBy),
          status: 'blocked',
        },
      }),
    ]);
  }

  async unblockStudent(studentId: number, unblockedBy: number): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.students.update({
        where: { id: BigInt(studentId) },
        data: { status: 'Active', updated_by: BigInt(unblockedBy) },
      }),
      this.prisma.student_block_histories.updateMany({
        where: { student_id: BigInt(studentId), status: 'blocked' },
        data: { status: 'unblocked', unblocked_by: BigInt(unblockedBy) },
      }),
    ]);
  }

  async dropStudent(params: DropStudentParams): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.students.update({
        where: { id: BigInt(params.studentId) },
        data: { status: 'Dropped', updated_by: BigInt(params.droppedBy) },
      }),
      this.prisma.student_drop_histories.create({
        data: {
          student_id: BigInt(params.studentId),
          reason: params.reason ?? null,
          dropped_by: BigInt(params.droppedBy),
        },
      }),
    ]);
  }

  async undropStudent(studentId: number, updatedBy: number): Promise<void> {
    await this.prisma.students.update({
      where: { id: BigInt(studentId) },
      data: { status: 'Active', updated_by: BigInt(updatedBy) },
    });
  }

  async unblockModules(studentId: number, studentSectionId: number): Promise<void> {
    await this.prisma.student_section_modules.updateMany({
      where: {
        student_section_id: BigInt(studentSectionId),
        student_section: { student_id: BigInt(studentId) },
        status: 'Locked',
      },
      data: { status: 'Unlocked' },
    });
  }

  async softDelete(id: number, deletedBy: number): Promise<void> {
    await this.prisma.students.update({
      where: { id: BigInt(id) },
      data: { status: 'Deleted', updated_by: BigInt(deletedBy) },
    });
  }

  async findBlockReasons(): Promise<StudentBlockReason[]> {
    const records = await this.prisma.student_block_reasons.findMany({
      where: { status: 'active' },
      orderBy: { name: 'asc' },
    });
    return records.map(
      (r) =>
        new StudentBlockReason({
          id: Number(r.id),
          name: r.name,
          status: r.status,
          createdAt: r.created_at,
        })
    );
  }

  private mapToDomain(raw: {
    id: bigint;
    first_name: string;
    last_name: string;
    gender: string;
    date_of_birth: Date | null;
    mobile_no: string;
    alternate_mobile_no: string | null;
    parent_mobile_no: string | null;
    parent_name: string | null;
    address: string | null;
    location: string | null;
    pincode: string | null;
    state: string | null;
    email: string;
    username: string;
    password: string;
    profile_pic: string | null;
    qualification: string | null;
    last_login_on: Date | null;
    status: string;
    login_status: string;
    sales_person_name: string | null;
    sales_person_phone: string | null;
    paid_amount: Prisma.Decimal;
    created_by: bigint;
    updated_by: bigint;
    special_category_id: bigint | null;
    created_at: Date | null;
    updated_at: Date | null;
  }): Student {
    const props: StudentProps = {
      id: Number(raw.id),
      firstName: raw.first_name,
      lastName: raw.last_name,
      gender: raw.gender,
      dateOfBirth: raw.date_of_birth,
      mobileNo: raw.mobile_no,
      alternateMobileNo: raw.alternate_mobile_no,
      parentMobileNo: raw.parent_mobile_no,
      parentName: raw.parent_name,
      address: raw.address,
      location: raw.location,
      pincode: raw.pincode,
      state: raw.state,
      email: raw.email,
      username: raw.username,
      passwordHash: raw.password,
      profilePic: raw.profile_pic,
      qualification: raw.qualification,
      lastLoginOn: raw.last_login_on,
      status: raw.status,
      loginStatus: raw.login_status,
      salesPersonName: raw.sales_person_name,
      salesPersonPhone: raw.sales_person_phone,
      paidAmount: Number(raw.paid_amount),
      createdBy: Number(raw.created_by),
      updatedBy: Number(raw.updated_by),
      specialCategoryId: raw.special_category_id ? Number(raw.special_category_id) : null,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };

    return new Student(props);
  }
}
