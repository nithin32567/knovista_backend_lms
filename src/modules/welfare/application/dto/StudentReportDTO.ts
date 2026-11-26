import { z } from 'zod';

const isoDateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
  }, 'Invalid calendar date');

export const createStudentReportSchema = z.object({
  student_id: z.coerce.number().int().positive(),
  report_head_id: z.coerce.number().int().positive(),
  description: z.string().optional().nullable(),
});

export type CreateStudentReportInput = z.infer<typeof createStudentReportSchema>;

export const listStudentReportsQuerySchema = z.object({
  student_id: z.coerce.number().int().positive().optional(),
  report_head_id: z.coerce.number().int().positive().optional(),
  date_from: isoDateStringSchema.optional(),
  date_to: isoDateStringSchema.optional(),
  role: z.string().trim().min(1).optional(),
});

export type ListStudentReportsQuery = z.infer<typeof listStudentReportsQuerySchema>;

export interface StudentReportResponseDTO {
  id: number;
  student: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    mobile_no: string;
  } | null;
  report_head: string | null;
  description: string | null;
  created_by: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    mobile_no: string | null;
    role: string | null;
  } | null;
  created_at: string | null;
}

export interface StudentReportHeadResponseDTO {
  id: number;
  name: string;
  status: string;
  created_by: number | null;
  updated_by: number | null;
  created_at: string | null;
  updated_at: string | null;
}
