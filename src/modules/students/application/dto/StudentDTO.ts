import { z } from 'zod';

export const ListStudentsQuerySchema = z.object({
  page: z.preprocess((val) => (val !== undefined ? Number(val) : 1), z.number().int().min(1).default(1)),
  per_page: z.preprocess((val) => (val !== undefined ? Number(val) : 15), z.number().int().min(1).max(100).default(15)),
  keyword: z.string().optional(),
  status: z.string().optional(),
  location: z.string().optional(),
  login_status: z.string().optional(),
  batch_name: z.string().optional(),
  program_name: z.string().optional(),
  completion_start: z.preprocess((val) => (val !== undefined && val !== '' ? Number(val) : undefined), z.number().optional()),
  completion_end: z.preprocess((val) => (val !== undefined && val !== '' ? Number(val) : undefined), z.number().optional()),
});

export type ListStudentsQueryInput = z.infer<typeof ListStudentsQuerySchema>;

export const CreateStudentSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required').max(50),
  last_name: z.string().trim().min(1, 'Last name is required').max(50),
  email: z.string().trim().email('Invalid email address').max(100),
  username: z.string().trim().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  password_confirmation: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).default('Male'),
  date_of_birth: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  mobile_no: z.string().trim().min(10, 'Mobile number must be at least 10 digits').max(15).optional().default('0000000000'),
  alternate_mobile_no: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  parent_mobile_no: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  parent_name: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  address: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  location: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  pincode: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  state: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  qualification: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  special_category_id: z.preprocess((val) => (val === '' || val === null || val === undefined ? null : Number(val)), z.number().nullable().optional()),
  sales_person_name: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  sales_person_phone: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  paid_amount: z.preprocess((val) => (val === '' || val === null || val === undefined ? 0 : Number(val)), z.number().default(0)),
});

export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;

export const AdminResetStudentPasswordSchema = z
  .object({
    student_id: z.coerce.number().int().positive('Valid student ID is required'),
    new_password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string().min(6, 'Confirm password must be at least 6 characters'),
    reseted_by: z.preprocess(
      (val) => (val !== undefined && val !== null && val !== '' ? Number(val) : undefined),
      z.number().int().positive().optional()
    ),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export type AdminResetStudentPasswordInput = z.infer<typeof AdminResetStudentPasswordSchema>;

