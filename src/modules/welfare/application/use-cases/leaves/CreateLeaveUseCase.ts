import { PrismaClient } from '@prisma/client';
import { IStudentLeaveRepository } from '../../../domain/repositories/IStudentLeaveRepository';
import { IAdminNotificationRepository } from '../../../../notification/domain/repositories/IAdminNotificationRepository';
import { NotFoundError } from '../../../../../shared/errors/NotFoundError';
import { env } from '../../../../../config/env';

export interface CreateLeaveExecutionInput {
  student_id: number;
  start_date: string;
  end_date: string;
  no_of_days?: number | null | undefined;
  reason_id: number;
  description?: string | null | undefined;
}

export interface CreateLeaveResult {
  id: number;
  student_id: number;
  start_date: string | null;
  end_date: string | null;
  no_of_days: number | null;
  reason_id: number | null;
  description: string | null;
  proof: string | null;
  status: string;
  created_at: string | null;
}

export class CreateLeaveUseCase {
  constructor(
    private readonly leaveRepository: IStudentLeaveRepository,
    private readonly adminNotificationRepository: IAdminNotificationRepository,
    private readonly prisma: PrismaClient,
  ) {}

  async execute(
    input: CreateLeaveExecutionInput,
    proofPath: string | null,
    createdBy: number | null,
  ): Promise<CreateLeaveResult> {
    const [student, reason] = await Promise.all([
      this.prisma.students.findUnique({
        where: { id: BigInt(input.student_id) },
        select: { id: true, first_name: true, last_name: true, status: true },
      }),
      this.prisma.leave_reasons.findUnique({
        where: { id: BigInt(input.reason_id) },
        select: { id: true, status: true },
      }),
    ]);

    if (!student || student.status === 'Deleted') {
      throw new NotFoundError('Student not found');
    }

    if (!reason || reason.status === 'deleted') {
      throw new NotFoundError('Leave reason not found');
    }

    const startDate = new Date(`${input.start_date}T00:00:00.000Z`);
    const endDate = new Date(`${input.end_date}T00:00:00.000Z`);

    const noOfDays =
      input.no_of_days ??
      Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const leave = await this.leaveRepository.create({
      studentId: input.student_id,
      startDate: input.start_date,
      endDate: input.end_date,
      noOfDays,
      reasonId: input.reason_id,
      description: input.description ?? null,
      proofPath,
      createdBy,
    });

    const studentName = `${student.first_name} ${student.last_name}`.trim() || 'A student';
    await this.notifyTutor(leave.studentId, studentName, input.start_date, input.end_date);

    const proofUrl = leave.proof
      ? `${env.APP_URL}/api/student-leaves/${leave.id}/proof`
      : null;

    return {
      id: leave.id,
      student_id: leave.studentId,
      start_date: leave.startDate.toISOString().split('T')[0] ?? null,
      end_date: leave.endDate.toISOString().split('T')[0] ?? null,
      no_of_days: leave.noOfDays,
      reason_id: leave.reasonId,
      description: leave.description,
      proof: proofUrl,
      status: leave.status,
      created_at: leave.createdAt ? leave.createdAt.toISOString() : null,
    };
  }

  private async notifyTutor(
    studentId: number,
    studentName: string,
    startDate: string,
    endDate: string,
  ): Promise<void> {
    const section = await this.prisma.student_sections.findFirst({
      where: {
        student_id: BigInt(studentId),
        status: { in: ['Active', 'active'] },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!section?.batch_id) {
      return;
    }

    const batch = await this.prisma.program_section_batches.findUnique({
      where: { id: section.batch_id },
      select: { tutor_id: true },
    });

    if (!batch?.tutor_id) {
      return;
    }

    await this.adminNotificationRepository.create({
      userId: Number(batch.tutor_id),
      message: `${studentName} has submitted a leave request from ${startDate} to ${endDate}.`,
    });
  }
}
