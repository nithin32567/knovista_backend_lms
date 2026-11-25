import { PrismaClient } from '@prisma/client';

export interface DailyQuote {
  id: number;
  quote: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

export class GetDailyQuotesUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(): Promise<DailyQuote[]> {
    const records = await this.prisma.daily_quotes.findMany({
      where: { status: { not: 'deleted' } },
      orderBy: { created_at: 'desc' },
    });

    return records.map((r) => ({
      id: Number(r.id),
      quote: r.quote,
      status: r.status,
      created_at: r.created_at ? r.created_at.toISOString() : null,
      updated_at: r.updated_at ? r.updated_at.toISOString() : null,
    }));
  }
}
