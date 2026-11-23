import { CourseModule } from '../entities/CourseModule';

export interface CreateModuleData {
  sectionId: number;
  name: string;
  description?: string | null | undefined;
  order?: number | undefined;
  createdBy: number;
  updatedBy: number;
}

export interface UpdateModuleData {
  name?: string | undefined;
  description?: string | null | undefined;
  order?: number | undefined;
  status?: string | undefined;
  updatedBy: number;
}

export interface IModuleRepository {
  findMany(sectionId?: number | undefined, status?: string | undefined): Promise<CourseModule[]>;
  findById(id: number): Promise<CourseModule | null>;
  create(data: CreateModuleData): Promise<CourseModule>;
  update(id: number, data: UpdateModuleData): Promise<CourseModule | null>;
}
