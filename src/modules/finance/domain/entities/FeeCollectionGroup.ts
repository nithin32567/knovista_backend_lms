import { FeeStatus, ApprovalStatus } from './FeeCollection';

export interface FeeInstallmentItem {
  id: number;
  installment_no: number;
  fee_amount: string;
  paid_amount: string;
  balance_amount: string;
  due_date: string;
  fee_status: FeeStatus;
  is_overdue: boolean;
  created_by: number | null;
  created_user: string | null;
  collected_by: number | null;
  collected_user: string | null;
  collected_at: string | null;
  approval_status: ApprovalStatus;
  auth_by: number | null;
  auth_user: string | null;
  auth_at: string | null;
  auth_remark: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface FeeStudentSection {
  id: number;
  name: string;
  amount: string;
}

export interface FeeStudentInfo {
  id: number;
  name: string;
  email: string;
  mobile_no: string;
  student_paid_amount: string;
  student_balance_amount: string;
  section: FeeStudentSection | null;
}

export class FeeCollectionGroup {
  constructor(
    public readonly student_id: number,
    public readonly student_section_id: number | null,
    public readonly total_amount: number,
    public readonly paid_amount: number,
    public readonly balance_amount: number,
    public readonly pending_amount: number,
    public readonly student: FeeStudentInfo,
    public readonly installments: FeeInstallmentItem[],
  ) {}
}

