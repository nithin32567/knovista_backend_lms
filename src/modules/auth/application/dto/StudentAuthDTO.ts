import { z } from 'zod';

export const StudentLoginSchema = z.preprocess((val) => {
  if (typeof val === 'object' && val !== null) {
    const raw = val as Record<string, unknown>;
    const identifier = raw['email_or_username_or_mobile'] ?? raw['login'];
    return {
      ...raw,
      email_or_username_or_mobile: identifier,
    };
  }
  return val;
}, z.object({
  email_or_username_or_mobile: z.string({
    required_error: 'Identifier is required',
  }).min(1, 'Identifier is required'),
  login: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
}));

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

export const ForgotPasswordSchema = z.object({
  email: z.string().email('A valid email address is required'),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const ChangePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  password: z.string().min(8, 'New password must be at least 8 characters'),
  password_confirmation: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

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
  student?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    mobile_no: string;
    gender: string;
    status: string;
    profile_pic: string | null;
    date_of_birth: string | null;
    created_at: string | null;
    last_login_on: string | null;
  };
  posters?: unknown[];
  intern_type?: string | null;
}
