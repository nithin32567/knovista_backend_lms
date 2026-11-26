import { createHash } from 'node:crypto';
import { Prisma, PrismaClient } from '@prisma/client';
import {
  IPasswordResetRepository,
  CreatePasswordResetParams,
} from '../../domain/repositories/IPasswordResetRepository';

export class PrismaPasswordResetRepository implements IPasswordResetRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(params: CreatePasswordResetParams): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.password_reset_tokens.deleteMany({
        where: { email: params.email, guard: params.guard },
      });
      await tx.password_reset_tokens.create({
        data: {
          email: params.email,
          token: this.hashToken(params.token),
          guard: params.guard,
          expires_at: params.expiresAt,
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  async resetStudentPassword(token: string, passwordHash: string): Promise<boolean> {
    const digest = this.hashToken(token);
    return this.prisma.$transaction(async (tx) => {
      const reset = await tx.password_reset_tokens.findUnique({ where: { token: digest } });
      if (!reset || reset.guard !== 'student') return false;
      const consumed = await tx.password_reset_tokens.deleteMany({
        where: { id: reset.id, token: digest, expires_at: { gt: new Date() } },
      });
      if (consumed.count !== 1) return false;
      const updated = await tx.students.updateMany({
        where: { email: reset.email, status: 'Active' },
        data: { password: passwordHash },
      });
      if (updated.count !== 1) return false;
      await tx.password_reset_tokens.deleteMany({ where: { email: reset.email, guard: reset.guard } });
      return true;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
