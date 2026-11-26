import { z } from 'zod';

const isoDateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
  }, 'Invalid calendar date');

export const createLeaveSchema = z
  .object({
    student_id: z.coerce.number().int().positive().optional(),
    start_date: isoDateStringSchema,
    end_date: isoDateStringSchema,
    no_of_days: z.coerce.number().int().positive().optional().nullable(),
    reason_id: z.coerce.number().int().positive(),
    description: z.string().optional().nullable(),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: 'end_date must be after or equal to start_date',
    path: ['end_date'],
  });

export type CreateLeaveInput = z.infer<typeof createLeaveSchema>;

export const authorizeLeaveSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  authorization_remark: z.string().optional().nullable(),
});

export type AuthorizeLeaveInput = z.infer<typeof authorizeLeaveSchema>;

export const listLeavesQuerySchema = z.object({
  student_id: z.coerce.number().int().positive().optional(),
  reason_id: z.coerce.number().int().positive().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'deleted']).optional(),
  date_from: isoDateStringSchema.optional(),
  date_to: isoDateStringSchema.optional(),
});

export type ListLeavesQuery = z.infer<typeof listLeavesQuerySchema>;

export const positiveIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export interface StudentLeaveResponseDTO {
  id: number;
  student: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    mobile_no: string;
  } | null;
  batch: {
    id: number;
    name: string;
    batch_type: string | null;
    batch_start_date: string | null;
    batch_end_date: string | null;
    status: string | null;
    tutor_id: number | null;
  } | null;
  start_date: string | null;
  end_date: string | null;
  no_of_days: number | null;
  reason: string | null;
  description: string | null;
  proof: string | null;
  status: string;
  authorized_by: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  authorization_remark: string | null;
  created_by: {
    id: number;
    first_name: string;
    last_name: string;
    role: string | null;
  } | null;
  created_at: string | null;
  updated_at: string | null;
}
