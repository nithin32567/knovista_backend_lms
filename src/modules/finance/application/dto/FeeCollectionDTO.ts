import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const CreateFeeScheduleSchema = z.object({
  student_id: z.number({ required_error: 'Student ID is required' }).int().positive(),
  student_section_id: z.number().int().positive().optional().nullable(),
  total_fee_amount: z.number().nonnegative().optional(),
  created_by: z.number().int().positive().optional(),
  installments: z
    .array(
      z.object({
        installment_no: z.number({ required_error: 'Installment number is required' }).int().positive(),
        fee_amount: z.number({ required_error: 'Fee amount is required' }).positive('Fee amount must be positive'),
        due_date: z.string().regex(dateRegex, 'Date must be YYYY-MM-DD format'),
      }),
    )
    .min(1, 'At least one installment is required'),
});

export type CreateFeeScheduleInput = z.infer<typeof CreateFeeScheduleSchema>;

export const CollectFeeSchema = z
  .object({
    fee_id: z.number().int().positive().optional(),
    fee_collection_id: z.number().int().positive().optional(),
    collected_amount: z.number().positive('Collected amount must be positive').optional(),
    paid_amount: z.number().positive('Paid amount must be positive').optional(),
    collected_by: z.number().int().positive().optional(),
  })
  .refine((data) => data.fee_id !== undefined || data.fee_collection_id !== undefined, {
    message: 'fee_id or fee_collection_id is required',
  })
  .refine((data) => data.collected_amount !== undefined || data.paid_amount !== undefined, {
    message: 'collected_amount or paid_amount is required',
  })
  .transform((data) => ({
    fee_id: (data.fee_id ?? data.fee_collection_id) as number,
    paid_amount: (data.collected_amount ?? data.paid_amount) as number,
    collected_by: data.collected_by,
  }));

export type CollectFeeInput = z.infer<typeof CollectFeeSchema>;

export const ApproveFeeSchema = z
  .object({
    fee_id: z.number().int().positive().optional(),
    fee_collection_id: z.number().int().positive().optional(),
    auth_status: z.enum(['approved', 'rejected']).optional(),
    approval_status: z.enum(['approved', 'rejected']).optional(),
    auth_by: z.number().int().positive().optional(),
    auth_remark: z.string().max(500).optional().nullable(),
  })
  .refine((data) => data.fee_id !== undefined || data.fee_collection_id !== undefined, {
    message: 'fee_id or fee_collection_id is required',
  })
  .refine((data) => data.auth_status !== undefined || data.approval_status !== undefined, {
    message: 'auth_status or approval_status is required',
  })
  .transform((data) => ({
    fee_id: (data.fee_id ?? data.fee_collection_id) as number,
    approval_status: (data.auth_status ?? data.approval_status) as 'approved' | 'rejected',
    auth_by: data.auth_by,
    auth_remark: data.auth_remark ?? undefined,
  }));

export type ApproveFeeInput = z.infer<typeof ApproveFeeSchema>;

export const UpdateInstallmentSchema = z
  .object({
    fee_id: z.number().int().positive().optional(),
    fee_collection_id: z.number().int().positive().optional(),
    updated_by: z.number().int().positive().optional(),
    installment_no: z.number().int().positive().optional(),
    fee_amount: z.number().positive('Fee amount must be positive').optional(),
    due_date: z.string().regex(dateRegex, 'Date must be YYYY-MM-DD format').optional(),
  })
  .refine((data) => data.fee_id !== undefined || data.fee_collection_id !== undefined, {
    message: 'fee_id or fee_collection_id is required',
  })
  .refine((data) => data.fee_amount !== undefined || data.due_date !== undefined, {
    message: 'At least one of fee_amount or due_date must be provided',
  })
  .transform((data) => ({
    fee_id: (data.fee_id ?? data.fee_collection_id) as number,
    fee_amount: data.fee_amount,
    due_date: data.due_date,
    updated_by: data.updated_by,
    installment_no: data.installment_no,
  }));

export type UpdateInstallmentInput = z.infer<typeof UpdateInstallmentSchema>;

export const DeleteInstallmentSchema = z
  .object({
    fee_id: z.number().int().positive().optional(),
    fee_collection_id: z.number().int().positive().optional(),
    deleted_by: z.number().int().positive().optional(),
  })
  .refine((data) => data.fee_id !== undefined || data.fee_collection_id !== undefined, {
    message: 'fee_id or fee_collection_id is required',
  })
  .transform((data) => ({
    fee_id: (data.fee_id ?? data.fee_collection_id) as number,
    deleted_by: data.deleted_by,
  }));

export type DeleteInstallmentInput = z.infer<typeof DeleteInstallmentSchema>;

export const CancelFeeSchema = z
  .object({
    fee_id: z.number().int().positive().optional(),
    fee_collection_id: z.number().int().positive().optional(),
    updated_by: z.number().int().positive().optional(),
  })
  .refine((data) => data.fee_id !== undefined || data.fee_collection_id !== undefined, {
    message: 'fee_id or fee_collection_id is required',
  })
  .transform((data) => ({
    fee_id: (data.fee_id ?? data.fee_collection_id) as number,
    updated_by: data.updated_by,
  }));

export type CancelFeeInput = z.infer<typeof CancelFeeSchema>;

export const FeeCollectionQuerySchema = z.object({
  student_id: z
    .string()
    .optional()
    .transform((v) => (v !== undefined ? parseInt(v, 10) : undefined)),
  student_section_id: z
    .string()
    .optional()
    .transform((v) => (v !== undefined ? parseInt(v, 10) : undefined)),
  fee_status: z.enum(['pending', 'collected', 'partial', 'cancelled']).optional(),
  approval_status: z.enum(['pending', 'approved', 'rejected']).optional(),
  date_from: z.string().regex(dateRegex).optional(),
  date_to: z.string().regex(dateRegex).optional(),
});

export type FeeCollectionQueryInput = z.infer<typeof FeeCollectionQuerySchema>;
