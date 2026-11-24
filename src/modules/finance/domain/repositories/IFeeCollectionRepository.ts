import { FeeCollection } from '../entities/FeeCollection';
import { FeeCollectionGroup } from '../entities/FeeCollectionGroup';

export interface FeeCollectionFilter {
  studentId?: number | undefined;
  studentSectionId?: number | undefined;
  feeStatus?: string | undefined;
  approvalStatus?: string | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
}

export interface CreateFeeInstallmentData {
  studentId: number;
  studentSectionId?: number | null | undefined;
  installmentNo: number;
  feeAmount: number;
  dueDate: Date;
  createdBy: number;
}

export interface CollectFeeData {
  paidAmount: number;
  collectedById: number;
  collectedAt: Date;
}

export interface ApproveFeeData {
  approvalStatus: 'approved' | 'rejected';
  authById: number;
  authAt: Date;
  authRemark?: string | undefined;
}

export interface UpdateInstallmentData {
  feeAmount?: number | undefined;
  dueDate?: Date | undefined;
  updatedBy: number;
}

export interface IFeeCollectionRepository {
  findGrouped(filter: FeeCollectionFilter): Promise<FeeCollectionGroup[]>;
  findAll(filter: FeeCollectionFilter): Promise<FeeCollection[]>;
  findById(id: number): Promise<FeeCollection | null>;
  createMany(installments: CreateFeeInstallmentData[]): Promise<FeeCollection[]>;
  collectFee(id: number, data: CollectFeeData): Promise<FeeCollection>;
  approveFee(id: number, data: ApproveFeeData): Promise<FeeCollection>;
  updateInstallment(id: number, data: UpdateInstallmentData): Promise<FeeCollection>;
  deleteInstallment(id: number): Promise<void>;
  cancelFee(id: number, updatedBy: number): Promise<FeeCollection>;
}
