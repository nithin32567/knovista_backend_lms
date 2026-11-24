import { z } from 'zod';

export const SaveSingleAssessmentAnswerSchema = z.object({
  student_id: z.number().int().positive(),
  student_topic_id: z.number().int().positive(),
  topic_id: z.number().int().positive(),
  assessment_id: z.number().int().positive(),
  answer: z.string(),
  marks: z.boolean().optional(),
});

export const SaveAssessmentAnswersSchema = z.object({
  answers: z.array(SaveSingleAssessmentAnswerSchema).min(1),
});

export type SaveAssessmentAnswersInput = z.infer<typeof SaveAssessmentAnswersSchema>;

export const GetStudentAssessmentAnswersQuerySchema = z.object({
  student_id: z.coerce.number().int().positive(),
  topic_id: z.coerce.number().int().positive(),
});

export type GetStudentAssessmentAnswersQuery = z.infer<typeof GetStudentAssessmentAnswersQuerySchema>;

export const TopicIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type TopicIdParam = z.infer<typeof TopicIdParamSchema>;

