import { ProgramSectionBatch } from '../entities/ProgramSectionBatch';

export interface CreateBatchData {
  sectionId: number;
  batchName: string;
  tutorId?: number | null | undefined;
  qaId?: number | null | undefined;
  placementOfficerId?: number | null | undefined;
  startDate?: Date | null | undefined;
  endDate?: Date | null | undefined;
  createdBy: number;
  updatedBy: number;
}

export interface UpdateBatchData {
  batchName?: string | undefined;
  tutorId?: number | null | undefined;
  qaId?: number | null | undefined;
  placementOfficerId?: number | null | undefined;
  startDate?: Date | null | undefined;
  endDate?: Date | null | undefined;
  status?: string | undefined;
  updatedBy: number;
}

export interface IBatchRepository {
  findMany(sectionId?: number | undefined, status?: string | undefined): Promise<ProgramSectionBatch[]>;
  findById(id: number): Promise<ProgramSectionBatch | null>;
  create(data: CreateBatchData): Promise<ProgramSectionBatch>;
  update(id: number, data: UpdateBatchData): Promise<ProgramSectionBatch | null>;
}

