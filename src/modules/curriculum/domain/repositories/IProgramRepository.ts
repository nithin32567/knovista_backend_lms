import { Program } from '../entities/Program';

export interface CreateProgramData {
  name: string;
  description?: string | null | undefined;
  createdBy: number;
  updatedBy: number;
}

export interface UpdateProgramData {
  name?: string | undefined;
  description?: string | null | undefined;
  status?: string | undefined;
  updatedBy: number;
}

export interface IProgramRepository {
  findMany(status?: string | undefined): Promise<Program[]>;
  findById(id: number): Promise<Program | null>;
  create(data: CreateProgramData): Promise<Program>;
  update(id: number, data: UpdateProgramData): Promise<Program | null>;
}
