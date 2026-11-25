import { describe, it, expect, vi } from 'vitest';
import { Program } from '../../modules/curriculum/domain/entities/Program';
import { Section } from '../../modules/curriculum/domain/entities/Section';
import { CourseModule } from '../../modules/curriculum/domain/entities/CourseModule';
import { Topic } from '../../modules/curriculum/domain/entities/Topic';
import { SpecialCategory } from '../../modules/curriculum/domain/entities/SpecialCategory';
import { IProgramRepository } from '../../modules/curriculum/domain/repositories/IProgramRepository';
import { ISectionRepository } from '../../modules/curriculum/domain/repositories/ISectionRepository';
import { IModuleRepository } from '../../modules/curriculum/domain/repositories/IModuleRepository';
import { ITopicRepository } from '../../modules/curriculum/domain/repositories/ITopicRepository';
import { ISpecialCategoryRepository } from '../../modules/curriculum/domain/repositories/ISpecialCategoryRepository';

import { ListProgramsUseCase } from '../../modules/curriculum/application/use-cases/programs/ListProgramsUseCase';
import { CreateProgramUseCase } from '../../modules/curriculum/application/use-cases/programs/CreateProgramUseCase';
import { GetProgramUseCase } from '../../modules/curriculum/application/use-cases/programs/GetProgramUseCase';
import { UpdateProgramUseCase } from '../../modules/curriculum/application/use-cases/programs/UpdateProgramUseCase';
import { DeleteProgramUseCase } from '../../modules/curriculum/application/use-cases/programs/DeleteProgramUseCase';
import { CloneProgramUseCase } from '../../modules/curriculum/application/use-cases/programs/CloneProgramUseCase';

import { ListSectionsUseCase } from '../../modules/curriculum/application/use-cases/sections/ListSectionsUseCase';
import { CreateSectionUseCase } from '../../modules/curriculum/application/use-cases/sections/CreateSectionUseCase';
import { GetSectionUseCase } from '../../modules/curriculum/application/use-cases/sections/GetSectionUseCase';

import { ListModulesUseCase } from '../../modules/curriculum/application/use-cases/modules/ListModulesUseCase';
import { CreateModuleUseCase } from '../../modules/curriculum/application/use-cases/modules/CreateModuleUseCase';

import { ListTopicsUseCase } from '../../modules/curriculum/application/use-cases/topics/ListTopicsUseCase';
import { CreateTopicUseCase } from '../../modules/curriculum/application/use-cases/topics/CreateTopicUseCase';

import { ListSpecialCategoriesUseCase } from '../../modules/curriculum/application/use-cases/special-categories/ListSpecialCategoriesUseCase';
import { CreateSpecialCategoryUseCase } from '../../modules/curriculum/application/use-cases/special-categories/CreateSpecialCategoryUseCase';

describe('Curriculum Module Unit Tests', () => {
  const dummyProgram = new Program({
    id: 1,
    name: 'Full Stack Web Development',
    description: 'Complete web dev course',
    status: 'Active',
    createdBy: 1,
    updatedBy: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const dummySection = new Section({
    id: 1,
    programId: 1,
    name: 'Frontend Engineering',
    description: 'HTML, CSS, React',
    durationInMonths: 3,
    status: 'Active',
    createdBy: 1,
    updatedBy: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const dummyModule = new CourseModule({
    id: 1,
    sectionId: 1,
    name: 'React Fundamentals',
    description: 'Components, Hooks, State',
    order: 1,
    status: 'Active',
    createdBy: 1,
    updatedBy: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const dummyTopic = new Topic({
    id: 1,
    moduleId: 1,
    name: 'Introduction to JSX',
    description: 'Understanding JSX syntax',
    type: 'video',
    contentUrl: 'https://example.com/video1',
    order: 1,
    status: 'Active',
    createdBy: 1,
    updatedBy: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const dummyCategory = new SpecialCategory({
    id: 1,
    name: 'Fast Track',
    description: 'Accelerated bootcamp track',
    status: 'Active',
    createdBy: 1,
    updatedBy: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  it('Program Use Cases: create, list, get, and update', async () => {
    const mockRepo: IProgramRepository = {
      findMany: vi.fn().mockResolvedValue([dummyProgram]),
      findById: vi.fn().mockResolvedValue(dummyProgram),
      create: vi.fn().mockResolvedValue(dummyProgram),
      update: vi.fn().mockResolvedValue(dummyProgram),
      delete: vi.fn().mockResolvedValue(true),
      clone: vi.fn().mockResolvedValue(2),
    };

    const listUseCase = new ListProgramsUseCase(mockRepo);
    const programs = await listUseCase.execute();
    expect(programs).toHaveLength(1);
    expect(programs[0]?.name).toBe('Full Stack Web Development');

    const createUseCase = new CreateProgramUseCase(mockRepo);
    const created = await createUseCase.execute({ name: 'Full Stack Web Development' }, 1);
    expect(created.name).toBe('Full Stack Web Development');

    const getUseCase = new GetProgramUseCase(mockRepo);
    const found = await getUseCase.execute(1);
    expect(found.id).toBe(1);

    const updateUseCase = new UpdateProgramUseCase(mockRepo);
    const updated = await updateUseCase.execute(1, { name: 'Full Stack' }, 1);
    expect(updated.id).toBe(1);

    const deleteUseCase = new DeleteProgramUseCase(mockRepo);
    await expect(deleteUseCase.execute(1, 1)).resolves.not.toThrow();

    const cloneUseCase = new CloneProgramUseCase(mockRepo);
    const clonedId = await cloneUseCase.execute({ program_id: 1 }, 1);
    expect(clonedId).toBe(2);
  });

  it('Section Use Cases: create and list', async () => {
    const mockSectionRepo: ISectionRepository = {
      findMany: vi.fn().mockResolvedValue([dummySection]),
      findById: vi.fn().mockResolvedValue(dummySection),
      create: vi.fn().mockResolvedValue(dummySection),
      update: vi.fn().mockResolvedValue(dummySection),
    };

    const mockProgramRepo: IProgramRepository = {
      findMany: vi.fn().mockResolvedValue([dummyProgram]),
      findById: vi.fn().mockResolvedValue(dummyProgram),
      create: vi.fn().mockResolvedValue(dummyProgram),
      update: vi.fn().mockResolvedValue(dummyProgram),
      delete: vi.fn().mockResolvedValue(true),
      clone: vi.fn().mockResolvedValue(2),
    };

    const listUseCase = new ListSectionsUseCase(mockSectionRepo);
    const sections = await listUseCase.execute(1);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.name).toBe('Frontend Engineering');

    const createUseCase = new CreateSectionUseCase(mockSectionRepo, mockProgramRepo);
    const created = await createUseCase.execute({ program_id: 1, name: 'Frontend Engineering' }, 1);
    expect(created.name).toBe('Frontend Engineering');

    const getUseCase = new GetSectionUseCase(mockSectionRepo);
    const found = await getUseCase.execute(1);
    expect(found.duration_in_months).toBe(3);
  });

  it('Module Use Cases: create and list', async () => {
    const mockModuleRepo: IModuleRepository = {
      findMany: vi.fn().mockResolvedValue([dummyModule]),
      findById: vi.fn().mockResolvedValue(dummyModule),
      create: vi.fn().mockResolvedValue(dummyModule),
      update: vi.fn().mockResolvedValue(dummyModule),
    };

    const mockSectionRepo: ISectionRepository = {
      findMany: vi.fn().mockResolvedValue([dummySection]),
      findById: vi.fn().mockResolvedValue(dummySection),
      create: vi.fn().mockResolvedValue(dummySection),
      update: vi.fn().mockResolvedValue(dummySection),
    };

    const listUseCase = new ListModulesUseCase(mockModuleRepo);
    const modules = await listUseCase.execute(1);
    expect(modules).toHaveLength(1);
    expect(modules[0]?.name).toBe('React Fundamentals');

    const createUseCase = new CreateModuleUseCase(mockModuleRepo, mockSectionRepo);
    const created = await createUseCase.execute({ section_id: 1, name: 'React Fundamentals' }, 1);
    expect(created.order).toBe(1);
  });

  it('Topic Use Cases: create and list', async () => {
    const mockTopicRepo: ITopicRepository = {
      findMany: vi.fn().mockResolvedValue([dummyTopic]),
      findById: vi.fn().mockResolvedValue(dummyTopic),
      create: vi.fn().mockResolvedValue(dummyTopic),
      update: vi.fn().mockResolvedValue(dummyTopic),
    };

    const mockModuleRepo: IModuleRepository = {
      findMany: vi.fn().mockResolvedValue([dummyModule]),
      findById: vi.fn().mockResolvedValue(dummyModule),
      create: vi.fn().mockResolvedValue(dummyModule),
      update: vi.fn().mockResolvedValue(dummyModule),
    };

    const listUseCase = new ListTopicsUseCase(mockTopicRepo);
    const topics = await listUseCase.execute(1);
    expect(topics).toHaveLength(1);
    expect(topics[0]?.type).toBe('video');

    const createUseCase = new CreateTopicUseCase(mockTopicRepo, mockModuleRepo);
    const created = await createUseCase.execute(
      { module_id: 1, name: 'Introduction to JSX', type: 'video' },
      1
    );
    expect(created.content_url).toBe('https://example.com/video1');
  });

  it('Special Category Use Cases: create and list', async () => {
    const mockCategoryRepo: ISpecialCategoryRepository = {
      findMany: vi.fn().mockResolvedValue([dummyCategory]),
      findById: vi.fn().mockResolvedValue(dummyCategory),
      create: vi.fn().mockResolvedValue(dummyCategory),
      update: vi.fn().mockResolvedValue(dummyCategory),
    };

    const listUseCase = new ListSpecialCategoriesUseCase(mockCategoryRepo);
    const categories = await listUseCase.execute();
    expect(categories).toHaveLength(1);
    expect(categories[0]?.name).toBe('Fast Track');

    const createUseCase = new CreateSpecialCategoryUseCase(mockCategoryRepo);
    const created = await createUseCase.execute({ name: 'Fast Track' }, 1);
    expect(created.name).toBe('Fast Track');
  });
});

