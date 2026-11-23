import { z } from 'zod';

export const TOPIC_TYPES = ['video', 'file', 'mcq', 'assignment'] as const;

export const CreateTopicSchema = z.object({
  module_id: z.number({ required_error: 'Module ID is required' }).int().positive(),
  name: z.string().min(1, 'Topic name is required').max(200),
  description: z.string().max(5000).optional().nullable(),
  type: z.enum(TOPIC_TYPES, { required_error: 'Topic type is required' }),
  content_url: z.string().url('Must be a valid URL').max(500).optional().nullable(),
  order: z.number().int().min(0).optional(),
});

export type CreateTopicInput = z.infer<typeof CreateTopicSchema>;

export const UpdateTopicSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  type: z.enum(TOPIC_TYPES).optional(),
  content_url: z.string().url('Must be a valid URL').max(500).optional().nullable(),
  order: z.number().int().min(0).optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
});

export type UpdateTopicInput = z.infer<typeof UpdateTopicSchema>;

export const TopicQuerySchema = z.object({
  module_id: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
  type: z.enum([...TOPIC_TYPES, '' as never]).optional(),
  status: z.string().optional(),
});

export type TopicQueryInput = z.infer<typeof TopicQuerySchema>;

