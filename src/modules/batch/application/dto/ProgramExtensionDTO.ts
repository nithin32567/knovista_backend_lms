import { z } from 'zod';

export const CreateExtensionSchema = z.object({
  student_section_id: z.number({ required_error: 'Student section ID is required' }).int().positive(),
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(2000),
  extension_months: z.number().int().min(1).max(12),
});

export type CreateExtensionInput = z.infer<typeof CreateExtensionSchema>;

export const UpdateExtensionSchema = z.object({
  status: z.enum(['Approved', 'Rejected']),
});

export type UpdateExtensionInput = z.infer<typeof UpdateExtensionSchema>;

export const ExtensionQuerySchema = z.object({
  student_section_id: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
  status: z.string().optional(),
});

export type ExtensionQueryInput = z.infer<typeof ExtensionQuerySchema>;

