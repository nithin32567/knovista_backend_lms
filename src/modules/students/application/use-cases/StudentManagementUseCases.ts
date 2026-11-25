import { IStudentRepository, BlockStudentParams, DropStudentParams } from '../../domain/repositories/IStudentRepository';
import { NotFoundError } from '../../../../shared/errors/NotFoundError';

export class BlockStudentUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(params: BlockStudentParams): Promise<void> {
    const student = await this.studentRepository.findById(params.studentId);
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    await this.studentRepository.blockStudent(params);
  }
}

export class UnblockStudentUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(studentId: number, unblockedBy: number): Promise<void> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    await this.studentRepository.unblockStudent(studentId, unblockedBy);
  }
}

export class DropStudentUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(params: DropStudentParams): Promise<void> {
    const student = await this.studentRepository.findById(params.studentId);
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    await this.studentRepository.dropStudent(params);
  }
}

export class UndropStudentUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(studentId: number, updatedBy: number): Promise<void> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    await this.studentRepository.undropStudent(studentId, updatedBy);
  }
}

export class DeleteStudentUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(studentId: number, deletedBy: number): Promise<void> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    await this.studentRepository.softDelete(studentId, deletedBy);
  }
}

export class GetStudentBlockReasonsUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute() {
    const reasons = await this.studentRepository.findBlockReasons();
    return reasons.map((r) => r.toResponseObject());
  }
}

export class UnblockStudentModulesUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(studentId: number, studentSectionId: number): Promise<void> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    await this.studentRepository.unblockModules(studentId, studentSectionId);
  }
}

export class UpdateLoginStatusUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(studentId: number, loginStatus: string): Promise<void> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    await this.studentRepository.updateLoginStatus(studentId, loginStatus);
  }
}

