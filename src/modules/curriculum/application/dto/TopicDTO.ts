import { z } from 'zod';

const emptyStringToUndefined = z.literal('').transform(() => undefined);
const optionalCoercedNumber = z.union([emptyStringToUndefined, z.coerce.number()]).optional().nullable();

export const TOPIC_TYPES = [
  'video', 'file', 'mcq', 'assignment',
  'Video', 'File', 'MCQ', 'Assignment',
] as const;

export const AssessmentItemSchema = z.object({
  question: z.string(),
  options: z.unknown().optional(),
  answer: z.unknown().optional(),
  priority: optionalCoercedNumber,
  status: z.string().optional(),
  correct_answer: z.string().optional().nullable(),
  marks: optionalCoercedNumber,
});

export const CreateTopicSchema = z.object({
  program_id: optionalCoercedNumber,
  section_id: optionalCoercedNumber,
  module_id: z.coerce.number({ required_error: 'Module ID is required' }).int().positive(),
  name: z.string().min(1, 'Topic name is required').max(200),
  description: z.string().max(5000).optional().nullable(),
  type: z.string().min(1, 'Topic type is required'),
  content_url: z.string().max(500).optional().nullable(),
  file_url: z.string().max(500).optional().nullable(),
  cover_image: z.string().optional().nullable(),
  day_count: optionalCoercedNumber,
  priority: optionalCoercedNumber,
  order: optionalCoercedNumber,
  status: z.enum(['Active', 'Inactive', 'Deleted']).optional(),
  assessments: z.unknown().optional(),
});

export type CreateTopicInput = z.infer<typeof CreateTopicSchema>;

export const UpdateTopicSchema = z.object({
  program_id: optionalCoercedNumber,
  section_id: optionalCoercedNumber,
  module_id: optionalCoercedNumber,
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  type: z.string().optional(),
  content_url: z.string().max(500).optional().nullable(),
  file_url: z.string().max(500).optional().nullable(),
  cover_image: z.string().optional().nullable(),
  day_count: optionalCoercedNumber,
  priority: optionalCoercedNumber,
  order: optionalCoercedNumber,
  status: z.enum(['Active', 'Inactive', 'Deleted']).optional(),
  assessments: z.unknown().optional(),
});

export type UpdateTopicInput = z.infer<typeof UpdateTopicSchema>;

export const TopicQuerySchema = z.object({
  module_id: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
  type: z.string().optional(),
  status: z.string().optional(),
});

export type TopicQueryInput = z.infer<typeof TopicQuerySchema>;
