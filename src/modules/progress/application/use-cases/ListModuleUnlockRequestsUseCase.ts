import { IProgressRepository } from '../../domain/repositories/IProgressRepository';
import { ListUnlockRequestsQueryInput } from '../dto/ProgressDTO';

export class ListModuleUnlockRequestsUseCase {
  constructor(private readonly progressRepository: IProgressRepository) {}

  async execute(query: ListUnlockRequestsQueryInput) {
    const page = query.page ?? 1;
    const perPage = query.per_page ?? 50;

    const { items, total } = await this.progressRepository.listUnlockRequests({
      studentId: query.student_id,
      batchId: query.batch_id,
      sectionId: query.section_id,
      loginStatus: query.login_status,
      keyword: query.keyword,
      page,
      perPage,
    });

    const lastPage = Math.max(1, Math.ceil(total / perPage));

    return {
      current_page: page,
      data: items.map((item) => item.toResponseObject()),
      total,
      per_page: perPage,
      last_page: lastPage,
    };
  }
}

