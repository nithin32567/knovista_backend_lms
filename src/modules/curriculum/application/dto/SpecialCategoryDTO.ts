import { z } from 'zod';

export const CreateSpecialCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  description: z.string().max(2000).optional().nullable(),
});

export type CreateSpecialCategoryInput = z.infer<typeof CreateSpecialCategorySchema>;

export const UpdateSpecialCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(['Active', 'Inactive']).optional(),
});

export type UpdateSpecialCategoryInput = z.infer<typeof UpdateSpecialCategorySchema>;

export const SpecialCategoryQuerySchema = z.object({
  status: z.string().optional(),
});

export type SpecialCategoryQueryInput = z.infer<typeof SpecialCategoryQuerySchema>;

