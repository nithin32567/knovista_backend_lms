import { Section } from '../entities/Section';

export interface CreateSectionData {
  programId: number;
  name: string;
  description?: string | null | undefined;
  durationInMonths?: number | null | undefined;
  createdBy: number;
  updatedBy: number;
}

export interface UpdateSectionData {
  name?: string | undefined;
  description?: string | null | undefined;
  durationInMonths?: number | null | undefined;
  status?: string | undefined;
  updatedBy: number;
}

export interface ISectionRepository {
  findMany(programId?: number | undefined, status?: string | undefined): Promise<Section[]>;
  findById(id: number): Promise<Section | null>;
  create(data: CreateSectionData): Promise<Section>;
  update(id: number, data: UpdateSectionData): Promise<Section | null>;
}
