import { Section } from '../entities/Section';

export interface CreateSectionData {
  programId: number;
  code?: string | null | undefined;
  name: string;
  icon?: string | null | undefined;
  coverImage?: string | null | undefined;
  duration?: string | null | undefined;
  amount?: number | null | undefined;
  priority?: number | null | undefined;
  description?: string | null | undefined;
  durationInMonths?: number | null | undefined;
  status?: string | undefined;
  isDemo?: boolean | undefined;
  createdBy: number;
  updatedBy: number;
}

export interface UpdateSectionData {
  programId?: number | undefined;
  code?: string | null | undefined;
  name?: string | undefined;
  icon?: string | null | undefined;
  coverImage?: string | null | undefined;
  duration?: string | null | undefined;
  amount?: number | null | undefined;
  priority?: number | null | undefined;
  description?: string | null | undefined;
  durationInMonths?: number | null | undefined;
  status?: string | undefined;
  isDemo?: boolean | undefined;
  updatedBy: number;
}

export interface ISectionRepository {
  findMany(programId?: number | undefined, status?: string | undefined): Promise<Section[]>;
  findById(id: number): Promise<Section | null>;
  create(data: CreateSectionData): Promise<Section>;
  update(id: number, data: UpdateSectionData): Promise<Section | null>;
}
