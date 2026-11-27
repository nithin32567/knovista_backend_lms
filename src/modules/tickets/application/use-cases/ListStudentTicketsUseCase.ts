import { ForbiddenError } from '../../../../shared/errors/ForbiddenError';
import { IStudentTicketRepository, StudentTicket } from '../../domain/repositories/IStudentTicketRepository';

export class ListStudentTicketsUseCase {
  constructor(private readonly repository: IStudentTicketRepository) {}

  async execute(studentId: number, requestedStudentId?: number): Promise<StudentTicket[]> {
    if (requestedStudentId !== undefined && requestedStudentId !== studentId) {
      throw new ForbiddenError('You can only view your own tickets');
    }

    return this.repository.listByStudentId(studentId);
  }
}
