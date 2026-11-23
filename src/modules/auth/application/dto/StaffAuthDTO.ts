import { z } from 'zod';

export const StaffLoginSchema = z.preprocess((val) => {
  if (typeof val === 'object' && val !== null) {
    const raw = val as Record<string, unknown>;
    const identifier = raw['email_or_username'] ?? raw['login'];
    return {
      ...raw,
      email_or_username: identifier,
    };
  }
  return val;
}, z.object({
  email_or_username: z.string({
    required_error: 'Email or username is required',
  }).min(1, 'Email or username is required'),
  login: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
}));

export type StaffLoginInput = z.infer<typeof StaffLoginSchema>;

export interface StaffAuthResponse {
  token: string;
  tokenType: 'bearer';
  token_type?: 'bearer';
  expiresIn: number;
  expires_in?: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: string;
    first_name?: string;
    last_name?: string;
    mobile_no?: string | null;
    gender?: string;
    status?: string;
    role_id?: number;
    profile_pic?: string | null;
    date_of_birth?: string | null;
    created_at?: string | null;
    last_login_on?: string | null;
    address?: string | null;
    location?: string | null;
    pincode?: string | null;
    state?: string | null;
    qualification?: string | null;
  };
  role?: {
    id: number;
    name: string;
    status?: string;
  };
}

