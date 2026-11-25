import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { ListStudentsUseCase } from '../../application/use-cases/ListStudentsUseCase';
import { CreateStudentUseCase } from '../../application/use-cases/CreateStudentUseCase';
import { ResetStudentPasswordUseCase } from '../../application/use-cases/ResetStudentPasswordUseCase';
import { UpdateStudentUseCase, UpdateStudentProfileUseCase, UpdateStudentProfileImageUseCase } from '../../application/use-cases/UpdateStudentUseCases';
import {
  BlockStudentUseCase,
  UnblockStudentUseCase,
  DropStudentUseCase,
  UndropStudentUseCase,
  DeleteStudentUseCase,
  GetStudentBlockReasonsUseCase,
  UnblockStudentModulesUseCase,
  UpdateLoginStatusUseCase,
} from '../../application/use-cases/StudentManagementUseCases';
import {
  ListStudentsQuerySchema,
  CreateStudentInput,
  AdminResetStudentPasswordInput,
  BlockStudentInput,
  UnblockStudentInput,
  DropStudentInput,
  UndropStudentInput,
  UnblockStudentModulesInput,
  UpdateStudentInput,
  UpdateStudentProfileInput,
  UpdateLoginStatusInput,
} from '../../application/dto/StudentDTO';
import { sendSuccess } from '../../../../shared/utils/response';
import { ValidationError } from '../../../../shared/errors/ValidationError';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';
import { ForbiddenError } from '../../../../shared/errors/ForbiddenError';

const profilePicsDir = path.join(process.cwd(), 'uploads', 'profile-pics');
if (!fs.existsSync(profilePicsDir)) {
  fs.mkdirSync(profilePicsDir, { recursive: true });
}

const profilePicStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, profilePicsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const profilePicUpload = multer({
  storage: profilePicStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ValidationError('Only jpeg, png, jpg, and gif images are allowed'));
    }
  },
});

export const handleProfilePicUpload = (req: Request, res: Response, next: NextFunction): void => {
  profilePicUpload.single('image')(req, res, (err: unknown) => {
    if (err) { next(err); return; }
    next();
  });
};

export class StudentController {
  constructor(
    private readonly listStudentsUseCase: ListStudentsUseCase,
    private readonly createStudentUseCase: CreateStudentUseCase,
    private readonly resetStudentPasswordUseCase?: ResetStudentPasswordUseCase | undefined,
    private readonly updateStudentUseCase?: UpdateStudentUseCase | undefined,
    private readonly updateStudentProfileUseCase?: UpdateStudentProfileUseCase | undefined,
    private readonly updateStudentProfileImageUseCase?: UpdateStudentProfileImageUseCase | undefined,
    private readonly blockStudentUseCase?: BlockStudentUseCase | undefined,
    private readonly unblockStudentUseCase?: UnblockStudentUseCase | undefined,
    private readonly dropStudentUseCase?: DropStudentUseCase | undefined,
    private readonly undropStudentUseCase?: UndropStudentUseCase | undefined,
    private readonly deleteStudentUseCase?: DeleteStudentUseCase | undefined,
    private readonly getBlockReasonsUseCase?: GetStudentBlockReasonsUseCase | undefined,
    private readonly unblockModulesUseCase?: UnblockStudentModulesUseCase | undefined,
    private readonly updateLoginStatusUseCase?: UpdateLoginStatusUseCase | undefined,
  ) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedQuery = ListStudentsQuerySchema.parse(req.query);
      const isSalesAnalyst = req.user?.role === 'Sales Analyst';
      const creatorId = isSalesAnalyst ? req.user?.id : undefined;
      const result = await this.listStudentsUseCase.execute(parsedQuery, creatorId);
      res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as CreateStudentInput;
      const creatorId = req.user?.id ?? 1;
      const student = await this.createStudentUseCase.execute(input, creatorId);
      sendSuccess(res, { student }, 'Student registered successfully.', 201);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.resetStudentPasswordUseCase) {
        throw new Error('Reset password use case not configured');
      }
      const input = req.body as AdminResetStudentPasswordInput;
      const currentUserId = req.user?.id;
      const result = await this.resetStudentPasswordUseCase.execute(input, currentUserId);
      sendSuccess(res, null, result.message);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.updateStudentUseCase) throw new Error('Update student use case not configured');
      const studentId = Number(req.params['id']);
      if (!studentId) throw new ValidationError('Invalid student ID');
      const input = req.body as UpdateStudentInput;
      const updatedBy = req.user?.id ?? 1;
      const student = await this.updateStudentUseCase.execute(studentId, { ...input, updatedBy });
      sendSuccess(res, { student: student.toResponseObject() }, 'Student updated successfully');
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.updateStudentProfileUseCase) throw new Error('Update profile use case not configured');
      const input = req.body as UpdateStudentProfileInput;
      const requestingStudentId = req.user?.id ?? 0;
      const student = await this.updateStudentProfileUseCase.execute(
        input.student_id,
        requestingStudentId,
        { ...input, updatedBy: input.student_id }
      );
      sendSuccess(res, { student: student.toResponseObject() }, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  };

  updateProfileImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.updateStudentProfileImageUseCase) throw new Error('Profile image use case not configured');
      const studentId = Number(req.body['student_id']);
      if (!studentId) throw new ValidationError('student_id is required');
      if (req.user?.type === 'student' && studentId !== req.user.id) {
        throw new ForbiddenError('Access denied');
      }
      if (!req.file) throw new ValidationError('Image file is required');
      const relativePath = `uploads/profile-pics/${req.file.filename}`;
      await this.updateStudentProfileImageUseCase.execute(studentId, relativePath, studentId);
      sendSuccess(res, { profile_pic: relativePath }, 'Profile image updated successfully');
    } catch (error) {
      next(error);
    }
  };

  blockStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.blockStudentUseCase) throw new Error('Block student use case not configured');
      const input = req.body as BlockStudentInput;
      const blockedBy = req.user?.id ?? 1;
      await this.blockStudentUseCase.execute({ studentId: input.student_id, reasonId: input.reason_id, description: input.description, blockedBy });
      sendSuccess(res, null, 'Student blocked successfully');
    } catch (error) {
      next(error);
    }
  };

  unblockStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.unblockStudentUseCase) throw new Error('Unblock student use case not configured');
      const input = req.body as UnblockStudentInput;
      const unblockedBy = req.user?.id ?? 1;
      await this.unblockStudentUseCase.execute(input.student_id, unblockedBy);
      sendSuccess(res, null, 'Student unblocked successfully');
    } catch (error) {
      next(error);
    }
  };

  dropStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.dropStudentUseCase) throw new Error('Drop student use case not configured');
      const input = req.body as DropStudentInput;
      const droppedBy = req.user?.id ?? 1;
      await this.dropStudentUseCase.execute({ studentId: input.student_id, reason: input.reason, droppedBy });
      sendSuccess(res, null, 'Student dropped successfully');
    } catch (error) {
      next(error);
    }
  };

  undropStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.undropStudentUseCase) throw new Error('Undrop student use case not configured');
      const input = req.body as UndropStudentInput;
      const updatedBy = req.user?.id ?? 1;
      await this.undropStudentUseCase.execute(input.student_id, updatedBy);
      sendSuccess(res, null, 'Student re-enrolled successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.deleteStudentUseCase) throw new Error('Delete student use case not configured');
      const studentId = Number(req.params['id']);
      if (!studentId) throw new NotFoundError('Student not found');
      const deletedBy = req.user?.id ?? 1;
      await this.deleteStudentUseCase.execute(studentId, deletedBy);
      sendSuccess(res, null, 'Student deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  getBlockReasons = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.getBlockReasonsUseCase) throw new Error('Get block reasons use case not configured');
      const reasons = await this.getBlockReasonsUseCase.execute();
      sendSuccess(res, reasons, 'Block reasons retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  unblockModules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.unblockModulesUseCase) throw new Error('Unblock modules use case not configured');
      const input = req.body as UnblockStudentModulesInput;
      await this.unblockModulesUseCase.execute(input.student_id, input.student_section_id);
      sendSuccess(res, null, 'Student modules unblocked successfully');
    } catch (error) {
      next(error);
    }
  };

  updateLoginStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.updateLoginStatusUseCase) throw new Error('Update login status use case not configured');
      const input = req.body as UpdateLoginStatusInput;
      if (req.user?.type === 'student' && input.student_id !== req.user.id) {
        throw new ForbiddenError('Access denied');
      }
      const loginStatus =
        input.login_type !== undefined
          ? input.login_type === 'login'
            ? 'active'
            : 'inactive'
          : (input.login_status ?? 'inactive');
      await this.updateLoginStatusUseCase.execute(input.student_id, loginStatus);
      sendSuccess(res, null, 'Login status updated');
    } catch (error) {
      next(error);
    }
  };
}
