import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../../../config/database';
import { env } from '../../../../config/env';
import { UnauthorizedError } from '../../../../shared/errors/UnauthorizedError';
import { authenticate } from '../../../../shared/middleware/authenticate';
import { sendSuccess } from '../../../../shared/utils/response';
import { ListStudentTicketsUseCase } from '../../application/use-cases/ListStudentTicketsUseCase';
import { PrismaStudentTicketRepository } from '../../infrastructure/persistence/PrismaStudentTicketRepository';

const ListStudentTicketsQuery = z.object({
  student_id: z.string().regex(/^[0-9]+$/).pipe(z.coerce.number().int().positive().safe()).optional(),
});

export function createStudentTicketRouter(): Router {
  const router = Router();
  const listTickets = new ListStudentTicketsUseCase(new PrismaStudentTicketRepository(prisma));

  router.get('/student/tickets/list', authenticate('student'), async (req, res, next): Promise<void> => {
    try {
      if (req.user?.type !== 'student') throw new UnauthorizedError('Student authentication required');
      const { student_id } = ListStudentTicketsQuery.parse(req.query);
      const tickets = await listTickets.execute(req.user.id, student_id);
      sendSuccess(res, tickets.map((ticket) => ({
        id: ticket.id,
        student_id: ticket.studentId,
        title: ticket.title,
        description: ticket.description,
        attachments: toAttachmentUrls(ticket.attachments, 'attachments'),
        assigned_to: ticket.assignedTo,
        assigned_by: ticket.assignedBy,
        status: ticket.status,
        replied_comment: ticket.repliedComment,
        replied_by: ticket.repliedBy,
        replied_on: ticket.repliedOn?.toISOString() ?? null,
        reply_attachments: toAttachmentUrls(ticket.replyAttachments, 'reply_attachments'),
        created_at: ticket.createdAt?.toISOString() ?? null,
        updated_at: ticket.updatedAt?.toISOString() ?? null,
      })));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

function toAttachmentUrls(paths: string[], directory: 'attachments' | 'reply_attachments'): string[] {
  const prefix = `student_tickets/${directory}/`;
  const base = env.APP_URL.replace(/\/$/, '');
  return paths.flatMap((value) => {
    const path = value.replace(/^public\//, '');
    if (!path.startsWith(prefix)) return [];
    const name = path.slice(prefix.length);
    if (!name || name === '.' || name === '..' || /[\/\\]/.test(name)) return [];
    return [`${base}/storage/${prefix}${encodeURIComponent(name)}`];
  });
}
