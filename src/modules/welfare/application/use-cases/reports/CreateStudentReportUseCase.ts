import { PrismaClient } from '@prisma/client';
import { IStudentReportRepository } from '../../../domain/repositories/IStudentReportRepository';
import { CreateStudentReportInput, StudentReportResponseDTO } from '../../dto/StudentReportDTO';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';

export class CreateStudentReportUseCase {
  constructor(
    private readonly reportRepository: IStudentReportRepository,
    private readonly prisma: PrismaClient,
  ) {}

  async execute(
    input: CreateStudentReportInput,
    createdBy: number | null,
  ): Promise<StudentReportResponseDTO> {
    const [student, head, creator] = await Promise.all([
      this.prisma.students.findUnique({
        where: { id: BigInt(input.student_id) },
        select: { id: true, first_name: true, last_name: true, email: true, mobile_no: true, status: true },
      }),
      this.prisma.student_report_heads.findUnique({
        where: { id: BigInt(input.report_head_id) },
        select: { id: true, name: true, status: true },
      }),
      createdBy !== null
        ? this.prisma.institution_users.findUnique({
            where: { id: BigInt(createdBy) },
            select: { id: true, first_name: true, last_name: true, email: true, mobile_no: true, role: true },
          })
        : Promise.resolve(null),
    ]);

    if (!student || student.status === 'Deleted') {
      throw new NotFoundError('Student not found');
    }

    if (!head || head.status === 'deleted') {
      throw new NotFoundError('Student report head not found');
    }

    const report = await this.reportRepository.create({
      studentId: input.student_id,
      reportHeadId: input.report_head_id,
      description: input.description ?? null,
      createdBy,
      updatedBy: createdBy,
    });

    return {
      id: report.id,
      student: {
        id: Number(student.id),
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        mobile_no: student.mobile_no,
      },
      report_head: head.name,
      description: report.description,
      created_by: creator
        ? {
            id: Number(creator.id),
            first_name: creator.first_name,
            last_name: creator.last_name,
            email: creator.email,
            mobile_no: creator.mobile_no,
            role: creator.role?.name ?? null,
          }
        : null,
      created_at: report.createdAt ? report.createdAt.toISOString() : null,
    };
  }
}
