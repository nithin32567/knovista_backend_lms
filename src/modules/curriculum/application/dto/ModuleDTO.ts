import { z } from 'zod';

export const CreateModuleSchema = z.object({
  section_id: z.number({ required_error: 'Section ID is required' }).int().positive(),
  name: z.string().min(1, 'Module name is required').max(150),
  description: z.string().max(5000).optional().nullable(),
  order: z.number().int().min(0).optional(),
});

export type CreateModuleInput = z.infer<typeof CreateModuleSchema>;

export const UpdateModuleSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  description: z.string().max(5000).optional().nullable(),
  order: z.number().int().min(0).optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
});

export type UpdateModuleInput = z.infer<typeof UpdateModuleSchema>;

export const ModuleQuerySchema = z.object({
  section_id: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
  status: z.string().optional(),
});

export type ModuleQueryInput = z.infer<typeof ModuleQuerySchema>;

