import { z } from 'zod';

export const CreateProgramSchema = z.object({
  code: z.string().min(1, 'Program code is required').max(50).optional().nullable(),
  name: z.string().min(1, 'Program name is required').max(255),
  language: z.string().max(50).optional(),
  description: z.string().max(5000).optional().nullable(),
  status: z.enum(['Active', 'Inactive', 'Deleted']).optional(),
  created_by: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined)),
  updated_by: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined)),
});

export type CreateProgramInput = z.infer<typeof CreateProgramSchema>;

export const UpdateProgramSchema = z.object({
  code: z.string().max(50).optional().nullable(),
  name: z.string().min(1).max(255).optional(),
  language: z.string().max(50).optional(),
  description: z.string().max(5000).optional().nullable(),
  status: z.enum(['Active', 'Inactive', 'Deleted']).optional(),
  updated_by: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined)),
});

export type UpdateProgramInput = z.infer<typeof UpdateProgramSchema>;

export const CloneProgramSchema = z.object({
  program_id: z.coerce.number({ required_error: 'Program ID is required' }).int().positive(),
});

export type CloneProgramInput = z.infer<typeof CloneProgramSchema>;

export const ProgramQuerySchema = z.object({
  status: z.string().optional(),
  language: z.string().optional(),
  code: z.string().optional(),
  name: z.string().optional(),
});

export type ProgramQueryInput = z.infer<typeof ProgramQuerySchema>;
