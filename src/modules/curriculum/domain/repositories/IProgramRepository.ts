import { Program } from '../entities/Program';

export interface ProgramFilter {
  status?: string | undefined;
  language?: string | undefined;
  code?: string | undefined;
  name?: string | undefined;
}

export interface CreateProgramData {
  code?: string | null | undefined;
  name: string;
  description?: string | null | undefined;
  language?: string | undefined;
  icon?: string | null | undefined;
  coverImage?: string | null | undefined;
  status?: string | undefined;
  createdBy: number;
  updatedBy: number;
}

export interface UpdateProgramData {
  code?: string | null | undefined;
  name?: string | undefined;
  description?: string | null | undefined;
  language?: string | undefined;
  icon?: string | null | undefined;
  coverImage?: string | null | undefined;
  status?: string | undefined;
  updatedBy: number;
}

export interface IProgramRepository {
  findMany(filter?: ProgramFilter | string | undefined): Promise<Program[]>;
  findById(id: number): Promise<Program | null>;
  create(data: CreateProgramData): Promise<Program>;
  update(id: number, data: UpdateProgramData): Promise<Program | null>;
  delete(id: number, updaterId: number): Promise<boolean>;
  clone(sourceProgramId: number, creatorId: number): Promise<number>;
}
