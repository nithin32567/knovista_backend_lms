import { z } from 'zod';

export const CreateStudentSectionSchema = z.object({
  student_id: z.number({ required_error: 'Student ID is required' }).int().positive(),
  batch_id: z.number({ required_error: 'Batch ID is required' }).int().positive(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
});

export type CreateStudentSectionInput = z.infer<typeof CreateStudentSectionSchema>;

export const UpdateStudentSectionSchema = z.object({
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  status: z.enum(['Active', 'Completed', 'Dropped', 'Suspended']).optional(),
  progress_percent: z.number().min(0).max(100).optional(),
});

export type UpdateStudentSectionInput = z.infer<typeof UpdateStudentSectionSchema>;

export const StudentSectionQuerySchema = z.object({
  batch_id: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
  student_id: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
  status: z.string().optional(),
});

export type StudentSectionQueryInput = z.infer<typeof StudentSectionQuerySchema>;

