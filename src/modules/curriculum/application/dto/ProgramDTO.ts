import { z } from 'zod';

export const CreateProgramSchema = z.object({
  name: z.string().min(1, 'Program name is required').max(150),
  description: z.string().max(5000).optional().nullable(),
});

export type CreateProgramInput = z.infer<typeof CreateProgramSchema>;

export const UpdateProgramSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  description: z.string().max(5000).optional().nullable(),
  status: z.enum(['Active', 'Inactive']).optional(),
});

export type UpdateProgramInput = z.infer<typeof UpdateProgramSchema>;

export const ProgramQuerySchema = z.object({
  status: z.string().optional(),
});

export type ProgramQueryInput = z.infer<typeof ProgramQuerySchema>;

