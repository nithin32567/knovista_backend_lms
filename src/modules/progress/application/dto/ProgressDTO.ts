import { z } from 'zod';

export const CompleteStudentTopicSchema = z.object({
  student_topic_id: z.coerce.number().int().positive('Valid student topic ID required'),
});

export type CompleteStudentTopicInput = z.infer<typeof CompleteStudentTopicSchema>;

export const RequestUnlockNextModuleSchema = z.object({
  student_id: z.coerce.number().int().positive('Valid student ID required'),
  section_id: z.coerce.number().int().positive('Valid section ID required'),
  next_module_id: z.coerce.number().int().positive('Valid next module ID required'),
});

export type RequestUnlockNextModuleInput = z.infer<typeof RequestUnlockNextModuleSchema>;

export const ListUnlockRequestsQuerySchema = z.object({
  student_id: z.coerce.number().int().positive().optional(),
  batch_id: z.coerce.number().int().positive().optional(),
  section_id: z.coerce.number().int().positive().optional(),
  login_status: z
    .preprocess((val) => {
      if (val === 'true' || val === true) return true;
      if (val === 'false' || val === false) return false;
      return undefined;
    }, z.boolean().optional())
    .optional(),
  keyword: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().positive().default(50),
});

export type ListUnlockRequestsQueryInput = z.infer<typeof ListUnlockRequestsQuerySchema>;

export const ApproveModuleUnlockSchema = z.object({
  student_id: z.coerce.number().int().positive('Valid student ID required'),
  section_id: z.coerce.number().int().positive('Valid section ID required'),
  student_section_id: z.coerce.number().int().positive('Valid student section ID required'),
  module_id: z.coerce.number().int().positive('Valid module ID required'),
});

export type ApproveModuleUnlockInput = z.infer<typeof ApproveModuleUnlockSchema>;

export const SavePerformanceSchema = z.object({
  student_section_module_id: z.coerce.number().int().positive('Valid student section module ID required'),
  performance: z.enum(['excellent', 'good', 'average', 'needs_improvement']),
  performance_description: z.string().optional().nullable(),
});

export type SavePerformanceInput = z.infer<typeof SavePerformanceSchema>;

export const ListPerformanceQuerySchema = z.object({
  student_id: z.coerce.number().int().positive().optional(),
  student_section_id: z.coerce.number().int().positive().optional(),
  batch_id: z.coerce.number().int().positive().optional(),
  section_id: z.coerce.number().int().positive().optional(),
  module_id: z.coerce.number().int().positive().optional(),
  performance: z.enum(['excellent', 'good', 'average', 'needs_improvement']).optional(),
  only_with_performance: z
    .preprocess((val) => {
      if (val === 'false' || val === false) return false;
      return true;
    }, z.boolean().default(true))
    .optional(),
});

export type ListPerformanceQueryInput = z.infer<typeof ListPerformanceQuerySchema>;

export const CompleteCourseSchema = z.object({
  student_section_id: z.coerce.number().int().positive('Valid student section ID required'),
});

export type CompleteCourseInput = z.infer<typeof CompleteCourseSchema>;

