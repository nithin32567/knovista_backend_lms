import { z } from 'zod';

export const ListInstitutionUsersQuerySchema = z.object({
  role_id: z.preprocess((val) => (val !== undefined && val !== '' ? Number(val) : undefined), z.number().int().optional()),
  status: z.string().optional(),
});

export type ListInstitutionUsersQueryInput = z.infer<typeof ListInstitutionUsersQuerySchema>;

export const GetUsersByRoleQuerySchema = z.object({
  role: z.string().trim().min(1, 'Role name is required'),
});

export type GetUsersByRoleQueryInput = z.infer<typeof GetUsersByRoleQuerySchema>;

export const CreateInstitutionUserSchema = z.object({
  role_id: z.preprocess((val) => (typeof val === 'string' ? Number(val) : val), z.number().int().positive('Role ID is required')),
  first_name: z.string().trim().min(1, 'First name is required').max(50),
  last_name: z.string().trim().min(1, 'Last name is required').max(50),
  gender: z.enum(['Male', 'Female', 'Other']).default('Male'),
  email: z.string().trim().email('Invalid email address').max(100),
  username: z.string().trim().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  date_of_birth: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  mobile_no: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  address: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  location: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  pincode: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  state: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  qualification: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  profile_pic: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
});

export type CreateInstitutionUserInput = z.infer<typeof CreateInstitutionUserSchema>;

