import { z } from 'zod';

export const MarkNotificationReadSchema = z.object({
  notification_id: z.number().int().positive().optional(),
});

export type MarkNotificationReadInput = z.infer<typeof MarkNotificationReadSchema>;

