import { Topic, TopicType } from '../entities/Topic';

export interface CreateTopicData {
  moduleId: number;
  name: string;
  description?: string | null | undefined;
  type: TopicType;
  contentUrl?: string | null | undefined;
  order?: number | undefined;
  createdBy: number;
  updatedBy: number;
}

export interface UpdateTopicData {
  name?: string | undefined;
  description?: string | null | undefined;
  type?: TopicType | undefined;
  contentUrl?: string | null | undefined;
  order?: number | undefined;
  status?: string | undefined;
  updatedBy: number;
}

export interface ITopicRepository {
  findMany(moduleId?: number | undefined, type?: string | undefined, status?: string | undefined): Promise<Topic[]>;
  findById(id: number): Promise<Topic | null>;
  create(data: CreateTopicData): Promise<Topic>;
  update(id: number, data: UpdateTopicData): Promise<Topic | null>;
}
