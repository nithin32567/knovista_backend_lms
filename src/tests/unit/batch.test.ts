import { describe, it, expect, vi } from 'vitest';
import { ProgramSectionBatch } from '../../modules/batch/domain/entities/ProgramSectionBatch';
import { StudentSection } from '../../modules/batch/domain/entities/StudentSection';
import { StudentSectionModule } from '../../modules/batch/domain/entities/StudentSectionModule';
import { ProgramExtension } from '../../modules/batch/domain/entities/ProgramExtension';
import { IBatchRepository } from '../../modules/batch/domain/repositories/IBatchRepository';
import { IStudentSectionRepository } from '../../modules/batch/domain/repositories/IStudentSectionRepository';
import { IProgramExtensionRepository } from '../../modules/batch/domain/repositories/IProgramExtensionRepository';

import { ListBatchesUseCase } from '../../modules/batch/application/use-cases/batches/ListBatchesUseCase';
import { CreateBatchUseCase } from '../../modules/batch/application/use-cases/batches/CreateBatchUseCase';
import { GetBatchUseCase } from '../../modules/batch/application/use-cases/batches/GetBatchUseCase';

import { ListStudentSectionsUseCase } from '../../modules/batch/application/use-cases/enrollments/ListStudentSectionsUseCase';
import { CreateStudentSectionUseCase } from '../../modules/batch/application/use-cases/enrollments/CreateStudentSectionUseCase';
import { GetStudentSectionUseCase } from '../../modules/batch/application/use-cases/enrollments/GetStudentSectionUseCase';
import { UpdateStudentSectionUseCase } from '../../modules/batch/application/use-cases/enrollments/UpdateStudentSectionUseCase';
import { DeleteStudentSectionUseCase } from '../../modules/batch/application/use-cases/enrollments/DeleteStudentSectionUseCase';
import { GetStudentMyBatchesUseCase } from '../../modules/batch/application/use-cases/enrollments/GetStudentMyBatchesUseCase';
import { GetStudentBatchModulesUseCase } from '../../modules/batch/application/use-cases/enrollments/GetStudentBatchModulesUseCase';

import { ListExtensionsUseCase } from '../../modules/batch/application/use-cases/extensions/ListExtensionsUseCase';
import { CreateExtensionUseCase } from '../../modules/batch/application/use-cases/extensions/CreateExtensionUseCase';
import { UpdateExtensionUseCase } from '../../modules/batch/application/use-cases/extensions/UpdateExtensionUseCase';

describe('Batch Module Unit Tests', () => {
  const dummyBatch = new ProgramSectionBatch({
    id: 1,
    sectionId: 1,
    batchName: 'Batch Alpha 2026',
    tutorId: 2,
    qaId: 3,
    placementOfficerId: 4,
    status: 'Active',
    createdBy: 1,
    updatedBy: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const dummyStudentSection = new StudentSection({
    id: 1,
    studentId: 10,
    batchId: 1,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-06-01'),
    status: 'Active',
    progressPercent: 25.5,
    createdBy: 1,
    updatedBy: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    batchName: 'Batch Alpha 2026',
  });

  const dummyModule = new StudentSectionModule({
    id: 1,
    studentSectionId: 1,
    moduleId: 5,
    status: 'Unlocked',
    unlockRequested: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    moduleName: 'React Fundamentals',
  });

  const dummyExtension = new ProgramExtension({
    id: 1,
    studentSectionId: 1,
    requestedBy: 1,
    reason: 'Medical Leave for 1 month',
    extensionMonths: 1,
    status: 'Pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  it('Batch Use Cases: create, list, and get', async () => {
    const mockBatchRepo: IBatchRepository = {
      findMany: vi.fn().mockResolvedValue([dummyBatch]),
      findById: vi.fn().mockResolvedValue(dummyBatch),
      create: vi.fn().mockResolvedValue(dummyBatch),
      update: vi.fn().mockResolvedValue(dummyBatch),
    };

    const listUseCase = new ListBatchesUseCase(mockBatchRepo);
    const batches = await listUseCase.execute();
    expect(batches).toHaveLength(1);
    expect(batches[0]?.batch_name).toBe('Batch Alpha 2026');

    const createUseCase = new CreateBatchUseCase(mockBatchRepo);
    const created = await createUseCase.execute({ section_id: 1, batch_name: 'Batch Alpha 2026' }, 1);
    expect(created.batch_name).toBe('Batch Alpha 2026');

    const getUseCase = new GetBatchUseCase(mockBatchRepo);
    const found = await getUseCase.execute(1);
    expect(found.tutor_id).toBe(2);
  });

  it('Enrollment Use Cases: create, list, update, and get student batches', async () => {
    const mockStudentSectionRepo: IStudentSectionRepository = {
      findMany: vi.fn().mockResolvedValue([dummyStudentSection]),
      findById: vi.fn().mockResolvedValue(dummyStudentSection),
      findByStudentAndBatch: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(dummyStudentSection),
      update: vi.fn().mockResolvedValue(dummyStudentSection),
      delete: vi.fn().mockResolvedValue(true),
      findModules: vi.fn().mockResolvedValue([dummyModule]),
      findByStudentId: vi.fn().mockResolvedValue([dummyStudentSection]),
    };

    const mockBatchRepo: IBatchRepository = {
      findMany: vi.fn().mockResolvedValue([dummyBatch]),
      findById: vi.fn().mockResolvedValue(dummyBatch),
      create: vi.fn().mockResolvedValue(dummyBatch),
      update: vi.fn().mockResolvedValue(dummyBatch),
    };

    const listUseCase = new ListStudentSectionsUseCase(mockStudentSectionRepo);
    const enrollments = await listUseCase.execute();
    expect(enrollments).toHaveLength(1);

    const createUseCase = new CreateStudentSectionUseCase(mockStudentSectionRepo, mockBatchRepo);
    const created = await createUseCase.execute({ student_id: 10, batch_id: 1 }, 1);
    expect(created.student_id).toBe(10);

    const getUseCase = new GetStudentSectionUseCase(mockStudentSectionRepo);
    const found = await getUseCase.execute(1);
    expect(found.progress_percent).toBe(25.5);

    const updateUseCase = new UpdateStudentSectionUseCase(mockStudentSectionRepo);
    const updated = await updateUseCase.execute(1, { progress_percent: 50 }, 1);
    expect(updated.id).toBe(1);

    const deleteUseCase = new DeleteStudentSectionUseCase(mockStudentSectionRepo);
    const deleteRes = await deleteUseCase.execute(1);
    expect(deleteRes.message).toBe('Enrollment removed successfully');

    const myBatchesUseCase = new GetStudentMyBatchesUseCase(mockStudentSectionRepo);
    const myBatches = await myBatchesUseCase.execute(10);
    expect(myBatches).toHaveLength(1);
    expect(myBatches[0]?.batch_name).toBe('Batch Alpha 2026');

    mockStudentSectionRepo.findByStudentAndBatch = vi.fn().mockResolvedValue(dummyStudentSection);
    const batchModulesUseCase = new GetStudentBatchModulesUseCase(mockStudentSectionRepo);
    const modules = await batchModulesUseCase.execute(10, 1);
    expect(modules).toHaveLength(1);
    expect(modules[0]?.module_name).toBe('React Fundamentals');
  });

  it('Extension Use Cases: create, list, and update', async () => {
    const mockExtensionRepo: IProgramExtensionRepository = {
      findMany: vi.fn().mockResolvedValue([dummyExtension]),
      findById: vi.fn().mockResolvedValue(dummyExtension),
      create: vi.fn().mockResolvedValue(dummyExtension),
      update: vi.fn().mockResolvedValue(new ProgramExtension({
        ...dummyExtension['props'],
        status: 'Approved',
      })),
    };

    const mockStudentSectionRepo: IStudentSectionRepository = {
      findMany: vi.fn().mockResolvedValue([dummyStudentSection]),
      findById: vi.fn().mockResolvedValue(dummyStudentSection),
      findByStudentAndBatch: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(dummyStudentSection),
      update: vi.fn().mockResolvedValue(dummyStudentSection),
      delete: vi.fn().mockResolvedValue(true),
      findModules: vi.fn().mockResolvedValue([]),
      findByStudentId: vi.fn().mockResolvedValue([]),
    };

    const listUseCase = new ListExtensionsUseCase(mockExtensionRepo);
    const list = await listUseCase.execute();
    expect(list).toHaveLength(1);

    const createUseCase = new CreateExtensionUseCase(mockExtensionRepo, mockStudentSectionRepo);
    const created = await createUseCase.execute({
      student_section_id: 1,
      reason: 'Medical Leave for 1 month',
      extension_months: 1,
    }, 1);
    expect(created.status).toBe('Pending');

    const updateUseCase = new UpdateExtensionUseCase(mockExtensionRepo, mockStudentSectionRepo);
    const updated = await updateUseCase.execute(1, { status: 'Approved' }, 1);
    expect(updated.status).toBe('Approved');
  });
});

