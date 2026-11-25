import { z } from 'zod';

export const MarkNotificationReadSchema = z.object({
  notification_id: z.number().int().positive().optional(),
});

export type MarkNotificationReadInput = z.infer<typeof MarkNotificationReadSchema>;

export const StudentNotificationsQuerySchema = z.object({
  student_id: z.coerce.number().int().positive('Valid student ID is required').optional(),
});

export type StudentNotificationsQueryInput = z.infer<typeof StudentNotificationsQuerySchema>;

export const MarkStudentNotificationsViewedSchema = z.object({
  student_id: z.coerce.number().int().positive('Valid student ID is required').optional(),
});

export type MarkStudentNotificationsViewedInput = z.infer<typeof MarkStudentNotificationsViewedSchema>;
