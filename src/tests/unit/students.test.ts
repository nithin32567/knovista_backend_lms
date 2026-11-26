import { describe, it, expect, vi } from 'vitest';
import { ListStudentsUseCase } from '../../modules/students/application/use-cases/ListStudentsUseCase';
import { CreateStudentUseCase } from '../../modules/students/application/use-cases/CreateStudentUseCase';
import { ResetStudentPasswordUseCase } from '../../modules/students/application/use-cases/ResetStudentPasswordUseCase';
import { IStudentRepository } from '../../modules/students/domain/repositories/IStudentRepository';
import { Student } from '../../modules/students/domain/entities/Student';
import { ValidationError } from '../../shared/errors/ValidationError';
import { NotFoundError } from '../../shared/errors/NotFoundError';

describe('Students Use Cases', () => {
  const dummyStudent = new Student({
    id: 1,
    firstName: 'Jane',
    lastName: 'Doe',
    gender: 'Female',
    mobileNo: '9876543210',
    email: 'jane@example.com',
    username: 'janedoe',
    passwordHash: 'hashed_password',
    status: 'Active',
    loginStatus: 'inactive',
    paidAmount: 100,
    createdBy: 1,
    updatedBy: 1,
  });

  const mockRepo: IStudentRepository = {
    findMany: vi.fn().mockResolvedValue({ students: [dummyStudent], total: 1 }),
    findById: vi.fn().mockResolvedValue(dummyStudent),
    findByEmail: vi.fn().mockResolvedValue(null),
    findByUsername: vi.fn().mockResolvedValue(null),
    findByMobile: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue(dummyStudent),
    update: vi.fn().mockResolvedValue(dummyStudent),
    updatePassword: vi.fn().mockResolvedValue(undefined),
    updateProfilePic: vi.fn().mockResolvedValue(undefined),
    updateStatus: vi.fn().mockResolvedValue(undefined),
    updateLoginStatus: vi.fn().mockResolvedValue(undefined),
    blockStudent: vi.fn().mockResolvedValue(undefined),
    unblockStudent: vi.fn().mockResolvedValue(undefined),
    dropStudent: vi.fn().mockResolvedValue(undefined),
    undropStudent: vi.fn().mockResolvedValue(undefined),
    unblockModules: vi.fn().mockResolvedValue(undefined),
    softDelete: vi.fn().mockResolvedValue(undefined),
    findBlockReasons: vi.fn().mockResolvedValue([]),
  };

  it('ListStudentsUseCase should return formatted student records and pagination', async () => {
    const listUseCase = new ListStudentsUseCase(mockRepo);
    const result = await listUseCase.execute({ page: 1, per_page: 15 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.full_name).toBe('Jane Doe');
    expect(result.pagination.total).toBe(1);
    expect(result.pagination.current_page).toBe(1);
  });

  it('CreateStudentUseCase should throw ValidationError when email already exists', async () => {
    const repoWithDuplicateEmail: IStudentRepository = {
      ...mockRepo,
      findByEmail: vi.fn().mockResolvedValue(dummyStudent),
    };

    const createUseCase = new CreateStudentUseCase(repoWithDuplicateEmail);

    await expect(
      createUseCase.execute(
        {
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'jane@example.com',
          username: 'janenew',
          password: 'password123',
          gender: 'Female',
          mobile_no: '9876543211',
          paid_amount: 0,
        },
        1
      )
    ).rejects.toThrow(ValidationError);
  });

  it('CreateStudentUseCase should successfully create student when input is valid', async () => {
    const createUseCase = new CreateStudentUseCase(mockRepo);
    const result = await createUseCase.execute(
      {
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@example.com',
        username: 'janedoe',
        password: 'password123',
        gender: 'Female',
        mobile_no: '9876543210',
        paid_amount: 100,
      },
      1
    );

    expect(result.id).toBe(1);
    expect(result.first_name).toBe('Jane');
    expect(result.email).toBe('jane@example.com');
  });

  it('ResetStudentPasswordUseCase should reset password when student exists', async () => {
    const resetUseCase = new ResetStudentPasswordUseCase(mockRepo);
    const result = await resetUseCase.execute(
      {
        student_id: 1,
        new_password: 'newpassword123',
        confirm_password: 'newpassword123',
        reseted_by: 99,
      },
      1
    );

    expect(result.message).toBe('Student password reset successfully');
    expect(mockRepo.updatePassword).toHaveBeenCalledWith(1, expect.any(String), 1);
  });

  it('ResetStudentPasswordUseCase should throw NotFoundError when student not found', async () => {
    const repoNotFound: IStudentRepository = {
      ...mockRepo,
      findById: vi.fn().mockResolvedValue(null),
    };

    const resetUseCase = new ResetStudentPasswordUseCase(repoNotFound);

    await expect(
      resetUseCase.execute({
        student_id: 999,
        new_password: 'newpassword123',
        confirm_password: 'newpassword123',
      }, 1)
    ).rejects.toThrow(NotFoundError);
  });
});

