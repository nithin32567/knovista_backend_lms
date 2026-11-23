import { describe, it, expect, vi } from 'vitest';
import { ListInstitutionUsersUseCase } from '../../modules/users/application/use-cases/ListInstitutionUsersUseCase';
import { CreateInstitutionUserUseCase } from '../../modules/users/application/use-cases/CreateInstitutionUserUseCase';
import { GetActiveRolesUseCase } from '../../modules/users/application/use-cases/GetActiveRolesUseCase';
import { GetUsersByRoleUseCase } from '../../modules/users/application/use-cases/GetUsersByRoleUseCase';
import { IInstitutionUserRepository } from '../../modules/users/domain/repositories/IInstitutionUserRepository';
import { IInstitutionRoleRepository } from '../../modules/users/domain/repositories/IInstitutionRoleRepository';
import { InstitutionUser } from '../../modules/users/domain/entities/InstitutionUser';
import { InstitutionRole } from '../../modules/users/domain/entities/InstitutionRole';
import { GetRolePermissionsUseCase } from '../../modules/users/application/use-cases/GetRolePermissionsUseCase';
import { ValidationError } from '../../shared/errors/ValidationError';
import { NotFoundError } from '../../shared/errors/NotFoundError';

describe('Institution Users & Roles Use Cases', () => {
  const dummyRole = new InstitutionRole({
    id: 1,
    name: 'Admin',
    status: 'Active',
    createdBy: 1,
    updatedBy: 1,
  });

  const dummyUser = new InstitutionUser({
    id: 1,
    roleId: 1,
    roleName: 'Admin',
    firstName: 'Admin',
    lastName: 'User',
    gender: 'Male',
    email: 'admin@example.com',
    username: 'admin',
    passwordHash: 'hashed_pwd',
    status: 'Active',
    createdBy: 1,
    updatedBy: 1,
  });

  const mockUserRepo: IInstitutionUserRepository = {
    findMany: vi.fn().mockResolvedValue([dummyUser]),
    findByRoleName: vi.fn().mockResolvedValue([dummyUser]),
    findById: vi.fn().mockResolvedValue(dummyUser),
    findByEmail: vi.fn().mockResolvedValue(null),
    findByUsername: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue(dummyUser),
  };

  const mockRoleRepo: IInstitutionRoleRepository = {
    findActiveRoles: vi.fn().mockResolvedValue([dummyRole]),
    findById: vi.fn().mockResolvedValue(dummyRole),
    findByName: vi.fn().mockResolvedValue(dummyRole),
  };

  it('ListInstitutionUsersUseCase should return institution user objects', async () => {
    const listUseCase = new ListInstitutionUsersUseCase(mockUserRepo);
    const users = await listUseCase.execute({});

    expect(users).toHaveLength(1);
    expect(users[0]?.role_name).toBe('Admin');
    expect(users[0]?.full_name).toBe('Admin User');
  });

  it('GetActiveRolesUseCase should return list of active roles', async () => {
    const activeRolesUseCase = new GetActiveRolesUseCase(mockRoleRepo);
    const roles = await activeRolesUseCase.execute();

    expect(roles).toHaveLength(1);
    expect(roles[0]?.name).toBe('Admin');
  });

  it('GetUsersByRoleUseCase should return users for the specified role', async () => {
    const byRoleUseCase = new GetUsersByRoleUseCase(mockUserRepo);
    const users = await byRoleUseCase.execute('Admin');

    expect(mockUserRepo.findByRoleName).toHaveBeenCalledWith('Admin');
    expect(users).toHaveLength(1);
  });

  it('CreateInstitutionUserUseCase should throw NotFoundError when role does not exist', async () => {
    const invalidRoleRepo: IInstitutionRoleRepository = {
      ...mockRoleRepo,
      findById: vi.fn().mockResolvedValue(null),
    };

    const createUseCase = new CreateInstitutionUserUseCase(mockUserRepo, invalidRoleRepo);

    await expect(
      createUseCase.execute(
        {
          role_id: 999,
          first_name: 'Test',
          last_name: 'User',
          gender: 'Male',
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        },
        1
      )
    ).rejects.toThrow(NotFoundError);
  });

  it('CreateInstitutionUserUseCase should throw ValidationError when email is already taken', async () => {
    const duplicateEmailUserRepo: IInstitutionUserRepository = {
      ...mockUserRepo,
      findByEmail: vi.fn().mockResolvedValue(dummyUser),
    };

    const createUseCase = new CreateInstitutionUserUseCase(duplicateEmailUserRepo, mockRoleRepo);

    await expect(
      createUseCase.execute(
        {
          role_id: 1,
          first_name: 'Test',
          last_name: 'User',
          gender: 'Male',
          email: 'admin@example.com',
          username: 'newadmin',
          password: 'password123',
        },
        1
      )
    ).rejects.toThrow(ValidationError);
  });

  it('CreateInstitutionUserUseCase should successfully create institution user', async () => {
    const createUseCase = new CreateInstitutionUserUseCase(mockUserRepo, mockRoleRepo);
    const result = await createUseCase.execute(
      {
        role_id: 1,
        first_name: 'Admin',
        last_name: 'User',
        gender: 'Male',
        email: 'admin@example.com',
        username: 'admin',
        password: 'password123',
      },
      1
    );

    expect(result.id).toBe(1);
    expect(result.role_name).toBe('Admin');
  });

  it('GetRolePermissionsUseCase should return admin permissions for Admin role', async () => {
    const useCase = new GetRolePermissionsUseCase();
    const result = await useCase.execute('Admin');

    expect(result.role).toBe('Admin');
    expect(result.permissions).toContain('programs.view');
    expect(result.permissions).toContain('programs.create');
    expect(result.permissions).toContain('batches.view');
    expect(result.permissions).toContain('interns.view');
  });

  it('GetRolePermissionsUseCase should return tailored permissions for Tutor role', async () => {
    const useCase = new GetRolePermissionsUseCase();
    const result = await useCase.execute('Tutor');

    expect(result.role).toBe('Tutor');
    expect(result.permissions).toContain('batches.view');
    expect(result.permissions).toContain('report.view');
    expect(result.permissions).not.toContain('users.delete');
  });
});

