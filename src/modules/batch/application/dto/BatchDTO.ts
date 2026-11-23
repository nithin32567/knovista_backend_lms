import { z } from 'zod';

export const CreateBatchSchema = z.object({
  section_id: z.number({ required_error: 'Section ID is required' }).int().positive(),
  batch_name: z.string().min(1, 'Batch name is required').max(150),
  tutor_id: z.number().int().positive().optional().nullable(),
  qa_id: z.number().int().positive().optional().nullable(),
  placement_officer_id: z.number().int().positive().optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
});

export type CreateBatchInput = z.infer<typeof CreateBatchSchema>;

export const UpdateBatchSchema = z.object({
  batch_name: z.string().min(1).max(150).optional(),
  tutor_id: z.number().int().positive().optional().nullable(),
  qa_id: z.number().int().positive().optional().nullable(),
  placement_officer_id: z.number().int().positive().optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  status: z.enum(['Active', 'Inactive', 'Completed']).optional(),
});

export type UpdateBatchInput = z.infer<typeof UpdateBatchSchema>;

export const BatchQuerySchema = z.object({
  section_id: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
  status: z.string().optional(),
});

export type BatchQueryInput = z.infer<typeof BatchQuerySchema>;

