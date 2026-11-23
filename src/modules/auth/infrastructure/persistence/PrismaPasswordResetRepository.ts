import { PrismaClient } from '@prisma/client';
import {
  IPasswordResetRepository,
  CreatePasswordResetParams,
} from '../../domain/repositories/IPasswordResetRepository';

export class PrismaPasswordResetRepository implements IPasswordResetRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(params: CreatePasswordResetParams): Promise<void> {
    await this.prisma.password_reset_tokens.deleteMany({
      where: { email: params.email, guard: params.guard },
    });
    await this.prisma.password_reset_tokens.create({
      data: {
        email: params.email,
        token: params.token,
        guard: params.guard,
        expires_at: params.expiresAt,
      },
    });
  }

  async findValidToken(token: string, guard: string): Promise<{ email: string } | null> {
    const record = await this.prisma.password_reset_tokens.findFirst({
      where: {
        token,
        guard,
        expires_at: { gt: new Date() },
      },
    });
    if (!record) return null;
    return { email: record.email };
  }

  async deleteByEmail(email: string, guard: string): Promise<void> {
    await this.prisma.password_reset_tokens.deleteMany({
      where: { email, guard },
    });
  }
}

