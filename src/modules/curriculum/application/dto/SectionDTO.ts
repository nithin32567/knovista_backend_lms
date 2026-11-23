import { z } from 'zod';

export const CreateSectionSchema = z.object({
  program_id: z.number({ required_error: 'Program ID is required' }).int().positive(),
  name: z.string().min(1, 'Section name is required').max(150),
  description: z.string().max(5000).optional().nullable(),
  duration_in_months: z.number().int().positive().optional().nullable(),
});

export type CreateSectionInput = z.infer<typeof CreateSectionSchema>;

export const UpdateSectionSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  description: z.string().max(5000).optional().nullable(),
  duration_in_months: z.number().int().positive().optional().nullable(),
  status: z.enum(['Active', 'Inactive']).optional(),
});

export type UpdateSectionInput = z.infer<typeof UpdateSectionSchema>;

export const SectionQuerySchema = z.object({
  program_id: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
  status: z.string().optional(),
});

export type SectionQueryInput = z.infer<typeof SectionQuerySchema>;

