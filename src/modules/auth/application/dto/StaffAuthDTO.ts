import { z } from 'zod';

export const StaffLoginSchema = z.object({
  email_or_username: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type StaffLoginInput = z.infer<typeof StaffLoginSchema>;

export interface StaffAuthResponse {
  token: string;
  tokenType: 'bearer';
  expiresIn: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: string;
  };
}

