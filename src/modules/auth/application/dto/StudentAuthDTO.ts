import { z } from 'zod';

export const StudentLoginSchema = z.object({
  email_or_username_or_mobile: z.string().min(1, 'Identifier is required'),
  password: z.string().min(1, 'Password is required'),
});

export type StudentLoginInput = z.infer<typeof StudentLoginSchema>;

export const StudentRegisterSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50),
  last_name: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address').max(100),
  mobile_no: z.string().min(10, 'Mobile number must be at least 10 digits').max(15),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  gender: z.enum(['Male', 'Female', 'Other']),
});

export type StudentRegisterInput = z.infer<typeof StudentRegisterSchema>;

export interface StudentAuthResponse {
  token: string;
  tokenType: 'bearer';
  expiresIn: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    mobileNo: string;
    role: 'student';
  };
}

