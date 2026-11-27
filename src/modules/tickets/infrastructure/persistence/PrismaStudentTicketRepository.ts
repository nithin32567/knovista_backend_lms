import { PrismaClient } from '@prisma/client';
import { IStudentTicketRepository, StudentTicket } from '../../domain/repositories/IStudentTicketRepository';

export class PrismaStudentTicketRepository implements IStudentTicketRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listByStudentId(studentId: number): Promise<StudentTicket[]> {
    const tickets = await this.prisma.student_tickets.findMany({
      where: { student_id: BigInt(studentId) },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    });

    return tickets.map((ticket) => ({
      id: Number(ticket.id),
      studentId: Number(ticket.student_id),
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      attachments: [
        ticket.attachment1,
        ticket.attachment2,
        ticket.attachment3,
        ticket.attachment4,
        ticket.attachment5,
      ].filter(isAttachmentPath),
      assignedTo: ticket.assigned_to,
      assignedBy: ticket.assigned_by === null ? null : Number(ticket.assigned_by),
      repliedComment: ticket.replied_comment,
      repliedBy: ticket.replied_by === null ? null : Number(ticket.replied_by),
      repliedOn: ticket.replied_on,
      replyAttachments: [ticket.reply_attachment1, ticket.reply_attachment2, ticket.reply_attachment3].filter(isAttachmentPath),
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
    }));
  }
}

function isAttachmentPath(value: string | null): value is string {
  return value !== null && value.trim().length > 0;
}
