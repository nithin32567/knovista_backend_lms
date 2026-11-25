import { z } from 'zod';

export const StudentDashboardQuerySchema = z.object({
  student_id: z.coerce.number().int().positive('Valid student ID is required').optional(),
});

export type StudentDashboardQueryInput = z.infer<typeof StudentDashboardQuerySchema>;

