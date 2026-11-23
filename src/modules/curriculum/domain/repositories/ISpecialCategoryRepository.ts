import { SpecialCategory } from '../entities/SpecialCategory';

export interface CreateSpecialCategoryData {
  name: string;
  description?: string | null | undefined;
  createdBy: number;
  updatedBy: number;
}

export interface UpdateSpecialCategoryData {
  name?: string | undefined;
  description?: string | null | undefined;
  status?: string | undefined;
  updatedBy: number;
}

export interface ISpecialCategoryRepository {
  findMany(status?: string | undefined): Promise<SpecialCategory[]>;
  findById(id: number): Promise<SpecialCategory | null>;
  create(data: CreateSpecialCategoryData): Promise<SpecialCategory>;
  update(id: number, data: UpdateSpecialCategoryData): Promise<SpecialCategory | null>;
}
