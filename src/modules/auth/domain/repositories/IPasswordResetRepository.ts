export interface CreatePasswordResetParams {
  email: string;
  token: string;
  guard: string;
  expiresAt: Date;
}

export interface IPasswordResetRepository {
  create(params: CreatePasswordResetParams): Promise<void>;
  findValidToken(token: string, guard: string): Promise<{ email: string } | null>;
  deleteByEmail(email: string, guard: string): Promise<void>;
}

