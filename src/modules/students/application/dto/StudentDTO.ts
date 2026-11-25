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

export const UpdateStudentSchema = z.object({
  first_name: z.string().trim().min(1).max(50).optional(),
  last_name: z.string().trim().min(1).max(50).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  date_of_birth: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  mobile_no: z.string().trim().max(15).optional(),
  alternate_mobile_no: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  parent_mobile_no: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  parent_name: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  address: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  location: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  pincode: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  state: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  email: z.string().trim().email().max(100).optional(),
  qualification: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  special_category_id: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().nullable().optional()
  ),
  sales_person_name: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  sales_person_phone: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  paid_amount: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
});

export type UpdateStudentInput = z.infer<typeof UpdateStudentSchema>;

export const UpdateStudentProfileSchema = z.object({
  student_id: z.coerce.number().int().positive('Valid student ID is required'),
  first_name: z.string().trim().min(1).max(50).optional(),
  last_name: z.string().trim().min(1).max(50).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  date_of_birth: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  mobile_no: z.string().trim().max(15).optional(),
  alternate_mobile_no: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  parent_mobile_no: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  parent_name: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  address: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  location: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  pincode: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  state: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
  email: z.string().trim().email().max(100).optional(),
  qualification: z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional()),
});

export type UpdateStudentProfileInput = z.infer<typeof UpdateStudentProfileSchema>;

export const BlockStudentSchema = z.object({
  student_id: z.coerce.number().int().positive('Valid student ID is required'),
  reason_id: z.coerce.number().int().positive('Valid reason ID is required'),
  description: z.string().optional(),
});

export type BlockStudentInput = z.infer<typeof BlockStudentSchema>;

export const UnblockStudentSchema = z.object({
  student_id: z.coerce.number().int().positive('Valid student ID is required'),
});

export type UnblockStudentInput = z.infer<typeof UnblockStudentSchema>;

export const DropStudentSchema = z.object({
  student_id: z.coerce.number().int().positive('Valid student ID is required'),
  reason: z.string().optional(),
});

export type DropStudentInput = z.infer<typeof DropStudentSchema>;

export const UndropStudentSchema = z.object({
  student_id: z.coerce.number().int().positive('Valid student ID is required'),
});

export type UndropStudentInput = z.infer<typeof UndropStudentSchema>;

export const DeleteStudentSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type DeleteStudentInput = z.infer<typeof DeleteStudentSchema>;

export const UnblockStudentModulesSchema = z.object({
  student_id: z.coerce.number().int().positive('Valid student ID is required'),
  student_section_id: z.coerce.number().int().positive('Valid student section ID is required'),
});

export type UnblockStudentModulesInput = z.infer<typeof UnblockStudentModulesSchema>;

export const UpdateProfileImageSchema = z.object({
  student_id: z.coerce.number().int().positive('Valid student ID is required'),
});

export type UpdateProfileImageInput = z.infer<typeof UpdateProfileImageSchema>;

export const StudentDashboardQuerySchema = z.object({
  student_id: z.coerce.number().int().positive('Valid student ID is required'),
});

export type StudentDashboardQueryInput = z.infer<typeof StudentDashboardQuerySchema>;

export const StudentNotificationsQuerySchema = z.object({
  student_id: z.coerce.number().int().positive('Valid student ID is required'),
});

export type StudentNotificationsQueryInput = z.infer<typeof StudentNotificationsQuerySchema>;

export const MarkStudentNotificationsViewedSchema = z.object({
  student_id: z.coerce.number().int().positive('Valid student ID is required'),
});

export type MarkStudentNotificationsViewedInput = z.infer<typeof MarkStudentNotificationsViewedSchema>;

export const UpdateLoginStatusSchema = z.object({
  student_id: z.coerce.number().int().positive('Valid student ID is required'),
  login_type: z.enum(['login', 'logout']).optional(),
  login_status: z.enum(['active', 'inactive']).optional(),
});

export type UpdateLoginStatusInput = z.infer<typeof UpdateLoginStatusSchema>;

