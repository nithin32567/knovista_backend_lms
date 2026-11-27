export interface StudentTicket {
  id: number;
  studentId: number;
  title: string;
  description: string;
  status: string;
  attachments: string[];
  assignedTo: string | null;
  assignedBy: number | null;
  repliedComment: string | null;
  repliedBy: number | null;
  repliedOn: Date | null;
  replyAttachments: string[];
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface IStudentTicketRepository {
  listByStudentId(studentId: number): Promise<StudentTicket[]>;
}
