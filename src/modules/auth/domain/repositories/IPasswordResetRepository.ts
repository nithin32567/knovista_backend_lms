export interface CreatePasswordResetParams {
  email: string;
  token: string;
  guard: string;
  expiresAt: Date;
}

export interface IPasswordResetRepository {
  create(params: CreatePasswordResetParams): Promise<void>;
  resetStudentPassword(token: string, passwordHash: string): Promise<boolean>;
}
