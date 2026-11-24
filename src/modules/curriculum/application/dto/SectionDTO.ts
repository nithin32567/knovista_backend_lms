import { z } from 'zod';

const emptyStringToUndefined = z.literal('').transform(() => undefined);
const optionalCoercedNumber = z.union([emptyStringToUndefined, z.coerce.number()]).optional().nullable();
const optionalBoolean = z.preprocess((val) => {
  if (val === 'true' || val === true || val === 1 || val === '1') return true;
  if (val === 'false' || val === false || val === 0 || val === '0') return false;
  return undefined;
}, z.boolean().optional());

export const CreateSectionSchema = z.object({
  program_id: z.coerce.number({ required_error: 'Program ID is required' }).int().positive(),
  code: z.string().min(1).max(50).optional().nullable(),
  name: z.string().min(1, 'Section name is required').max(150),
  description: z.string().max(5000).optional().nullable(),
  duration: z.union([emptyStringToUndefined, z.string(), z.number()]).optional().nullable().transform((v) => (v !== undefined && v !== null ? String(v) : undefined)),
  duration_in_months: optionalCoercedNumber,
  amount: optionalCoercedNumber,
  priority: optionalCoercedNumber,
  status: z.enum(['Active', 'Inactive', 'Deleted']).optional(),
  is_demo: optionalBoolean,
  icon: z.string().optional().nullable(),
  cover_image: z.string().optional().nullable(),
});

export type CreateSectionInput = z.infer<typeof CreateSectionSchema>;

export const UpdateSectionSchema = z.object({
  program_id: z.coerce.number().int().positive().optional(),
  code: z.string().min(1).max(50).optional().nullable(),
  name: z.string().min(1).max(150).optional(),
  description: z.string().max(5000).optional().nullable(),
  duration: z.union([emptyStringToUndefined, z.string(), z.number()]).optional().nullable().transform((v) => (v !== undefined && v !== null ? String(v) : undefined)),
  duration_in_months: optionalCoercedNumber,
  amount: optionalCoercedNumber,
  priority: optionalCoercedNumber,
  status: z.enum(['Active', 'Inactive', 'Deleted']).optional(),
  is_demo: optionalBoolean,
  icon: z.string().optional().nullable(),
  cover_image: z.string().optional().nullable(),
});

export type UpdateSectionInput = z.infer<typeof UpdateSectionSchema>;

export const SectionQuerySchema = z.object({
  program_id: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
  status: z.string().optional(),
});

export type SectionQueryInput = z.infer<typeof SectionQuerySchema>;
