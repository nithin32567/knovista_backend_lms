import { ProgramExtension } from '../entities/ProgramExtension';

export interface CreateExtensionData {
  studentSectionId: number;
  requestedBy: number;
  reason: string;
  extensionMonths: number;
}

export interface UpdateExtensionData {
  status: string;
  reviewedBy: number;
}

export interface IProgramExtensionRepository {
  findMany(studentSectionId?: number | undefined, status?: string | undefined): Promise<ProgramExtension[]>;
  findById(id: number): Promise<ProgramExtension | null>;
  create(data: CreateExtensionData): Promise<ProgramExtension>;
  update(id: number, data: UpdateExtensionData): Promise<ProgramExtension | null>;
}

