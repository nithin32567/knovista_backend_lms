import { Topic } from '../entities/Topic';

export interface AssessmentData {
  question: string;
  options: unknown;
  answer?: unknown | undefined;
  correctAnswer?: string | null | undefined;
  priority?: number | null | undefined;
  status?: string | undefined;
  marks?: number | undefined;
}

export interface CreateTopicData {
  moduleId: number;
  name: string;
  description?: string | null | undefined;
  type: string;
  coverImage?: string | null | undefined;
  fileUrl?: string | null | undefined;
  contentUrl?: string | null | undefined;
  dayCount?: number | null | undefined;
  priority?: number | null | undefined;
  order?: number | undefined;
  status?: string | undefined;
  createdBy: number;
  updatedBy: number;
  assessments?: AssessmentData[] | undefined;
}

export interface UpdateTopicData {
  moduleId?: number | undefined;
  name?: string | undefined;
  description?: string | null | undefined;
  type?: string | undefined;
  coverImage?: string | null | undefined;
  fileUrl?: string | null | undefined;
  contentUrl?: string | null | undefined;
  dayCount?: number | null | undefined;
  priority?: number | null | undefined;
  order?: number | undefined;
  status?: string | undefined;
  updatedBy: number;
  assessments?: AssessmentData[] | undefined;
}

export interface ITopicRepository {
  findMany(moduleId?: number | undefined, type?: string | undefined, status?: string | undefined): Promise<Topic[]>;
  findById(id: number): Promise<Topic | null>;
  create(data: CreateTopicData): Promise<Topic>;
  update(id: number, data: UpdateTopicData): Promise<Topic | null>;
}
