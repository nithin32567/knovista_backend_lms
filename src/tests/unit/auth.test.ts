import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { Student } from '../../modules/auth/domain/entities/Student';
import { InstitutionUser } from '../../modules/auth/domain/entities/InstitutionUser';
import { IStudentRepository } from '../../modules/auth/domain/repositories/IStudentRepository';
import { IInstitutionUserRepository } from '../../modules/auth/domain/repositories/IInstitutionUserRepository';
import { StudentLoginUseCase } from '../../modules/auth/application/use-cases/StudentLoginUseCase';
import { StudentRegisterUseCase } from '../../modules/auth/application/use-cases/StudentRegisterUseCase';
import { StaffLoginUseCase } from '../../modules/auth/application/use-cases/StaffLoginUseCase';
import { GetStudentProfileUseCase } from '../../modules/auth/application/use-cases/GetStudentProfileUseCase';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError';
import { ForbiddenError } from '../../shared/errors/ForbiddenError';
import { ValidationError } from '../../shared/errors/ValidationError';

describe('Auth Module Unit Tests', () => {
  let mockStudentRepo: IStudentRepository;
  let mockStaffRepo: IInstitutionUserRepository;

  beforeEach(() => {
    mockStudentRepo = {
      findById: vi.fn(),
      findByIdentifier: vi.fn(),
      findByEmail: vi.fn(),
      findByUsername: vi.fn(),
      findByMobile: vi.fn(),
      create: vi.fn(),
      updateLoginStatus: vi.fn(),
    };

    mockStaffRepo = {
      findById: vi.fn(),
      findByIdentifier: vi.fn(),
      updateLastLogin: vi.fn(),
    };
  });

  describe('StudentLoginUseCase', () => {
    it('should authenticate student and return token when credentials are valid', async () => {
      const passwordHash = await bcrypt.hash('Secret123!', 10);
      const student = new Student({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        mobileNo: '9876543210',
        passwordHash,
        status: 'Active',
        gender: 'Male',
        loginStatus: 'inactive',
        lastLoginOn: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockStudentRepo.findByIdentifier).mockResolvedValue(student);

      const useCase = new StudentLoginUseCase(mockStudentRepo);
      const result = await useCase.execute({
        email_or_username_or_mobile: 'john@example.com',
        password: 'Secret123!',
      });

      expect(result.token).toBeDefined();
      expect(result.tokenType).toBe('bearer');
      expect(result.user.id).toBe(1);
      expect(result.user.email).toBe('john@example.com');
      expect(mockStudentRepo.updateLoginStatus).toHaveBeenCalledWith(1, 'active');
    });

    it('should throw UnauthorizedError when student identifier does not exist', async () => {
      vi.mocked(mockStudentRepo.findByIdentifier).mockResolvedValue(null);

      const useCase = new StudentLoginUseCase(mockStudentRepo);
      await expect(
        useCase.execute({
          email_or_username_or_mobile: 'unknown@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw ForbiddenError when student status is Blocked', async () => {
      const passwordHash = await bcrypt.hash('Secret123!', 10);
      const student = new Student({
        id: 2,
        firstName: 'Blocked',
        lastName: 'User',
        username: 'blockeduser',
        email: 'blocked@example.com',
        mobileNo: '9876543211',
        passwordHash,
        status: 'Blocked',
        gender: 'Male',
        loginStatus: 'inactive',
        lastLoginOn: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockStudentRepo.findByIdentifier).mockResolvedValue(student);

      const useCase = new StudentLoginUseCase(mockStudentRepo);
      await expect(
        useCase.execute({
          email_or_username_or_mobile: 'blocked@example.com',
          password: 'Secret123!',
        })
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw UnauthorizedError when password does not match', async () => {
      const passwordHash = await bcrypt.hash('Secret123!', 10);
      const student = new Student({
        id: 3,
        firstName: 'Active',
        lastName: 'User',
        username: 'activeuser',
        email: 'active@example.com',
        mobileNo: '9876543212',
        passwordHash,
        status: 'Active',
        gender: 'Female',
        loginStatus: 'inactive',
        lastLoginOn: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockStudentRepo.findByIdentifier).mockResolvedValue(student);

      const useCase = new StudentLoginUseCase(mockStudentRepo);
      await expect(
        useCase.execute({
          email_or_username_or_mobile: 'active@example.com',
          password: 'WrongPassword!',
        })
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('StudentRegisterUseCase', () => {
    it('should register a new student and return token', async () => {
      vi.mocked(mockStudentRepo.findByEmail).mockResolvedValue(null);
      vi.mocked(mockStudentRepo.findByMobile).mockResolvedValue(null);
      vi.mocked(mockStudentRepo.findByUsername).mockResolvedValue(null);

      const newStudent = new Student({
        id: 10,
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'jane3210',
        email: 'jane@example.com',
        mobileNo: '9876543210',
        passwordHash: 'hashed_password',
        status: 'Active',
        gender: 'Female',
        loginStatus: 'inactive',
        lastLoginOn: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockStudentRepo.create).mockResolvedValue(newStudent);

      const useCase = new StudentRegisterUseCase(mockStudentRepo);
      const result = await useCase.execute({
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
        mobile_no: '9876543210',
        password: 'Password123!',
        gender: 'Female',
      });

      expect(result.token).toBeDefined();
      expect(result.user.id).toBe(10);
      expect(result.user.email).toBe('jane@example.com');
      expect(mockStudentRepo.create).toHaveBeenCalled();
    });

    it('should throw ValidationError when email is already registered', async () => {
      const existingStudent = new Student({
        id: 11,
        firstName: 'Existing',
        lastName: 'User',
        username: 'existing',
        email: 'duplicate@example.com',
        mobileNo: '9876543210',
        passwordHash: 'hash',
        status: 'Active',
        gender: 'Male',
        loginStatus: 'inactive',
        lastLoginOn: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockStudentRepo.findByEmail).mockResolvedValue(existingStudent);

      const useCase = new StudentRegisterUseCase(mockStudentRepo);
      await expect(
        useCase.execute({
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'duplicate@example.com',
          mobile_no: '9876543210',
          password: 'Password123!',
          gender: 'Female',
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('StaffLoginUseCase', () => {
    it('should authenticate staff user and include role in response', async () => {
      const passwordHash = await bcrypt.hash('StaffPass123!', 10);
      const staff = new InstitutionUser({
        id: 5,
        roleId: 1,
        roleName: 'Admin',
        firstName: 'Staff',
        lastName: 'Admin',
        username: 'admin',
        email: 'admin@institution.com',
        mobileNo: '9999999999',
        passwordHash,
        status: 'Active',
        gender: 'Other',
        lastLoginOn: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockStaffRepo.findByIdentifier).mockResolvedValue(staff);

      const useCase = new StaffLoginUseCase(mockStaffRepo);
      const result = await useCase.execute({
        email_or_username: 'admin@institution.com',
        password: 'StaffPass123!',
      });

      expect(result.token).toBeDefined();
      expect(result.user.role).toBe('Admin');
      expect(mockStaffRepo.updateLastLogin).toHaveBeenCalledWith(5);
    });

    it('should throw ForbiddenError when staff user is not Active', async () => {
      const passwordHash = await bcrypt.hash('StaffPass123!', 10);
      const staff = new InstitutionUser({
        id: 6,
        roleId: 2,
        roleName: 'Tutor',
        firstName: 'Inactive',
        lastName: 'Staff',
        username: 'inactivetutor',
        email: 'tutor@institution.com',
        mobileNo: '9999999998',
        passwordHash,
        status: 'Inactive',
        gender: 'Other',
        lastLoginOn: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockStaffRepo.findByIdentifier).mockResolvedValue(staff);

      const useCase = new StaffLoginUseCase(mockStaffRepo);
      await expect(
        useCase.execute({
          email_or_username: 'tutor@institution.com',
          password: 'StaffPass123!',
        })
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('GetStudentProfileUseCase', () => {
    it('should return student profile data', async () => {
      const student = new Student({
        id: 20,
        firstName: 'Profile',
        lastName: 'User',
        username: 'profileuser',
        email: 'profile@example.com',
        mobileNo: '9876543220',
        passwordHash: 'hash',
        status: 'Active',
        gender: 'Male',
        loginStatus: 'active',
        lastLoginOn: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(mockStudentRepo.findById).mockResolvedValue(student);

      const useCase = new GetStudentProfileUseCase(mockStudentRepo);
      const profile = await useCase.execute(20);

      expect(profile.id).toBe(20);
      expect(profile.fullName).toBe('Profile User');
      expect(profile.email).toBe('profile@example.com');
    });
  });
});

