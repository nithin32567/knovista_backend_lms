import { IStudentRepository } from '../../domain/repositories/IStudentRepository';
import { ListStudentsQueryInput } from '../dto/StudentDTO';
import { buildPaginationMeta, PaginationMeta } from '../../../../shared/utils/pagination';

export interface ListStudentsResult {
  data: ReturnType<InstanceType<typeof import('../../domain/entities/Student').Student>['toResponseObject']>[];
  pagination: PaginationMeta;
}

export class ListStudentsUseCase {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async execute(input: ListStudentsQueryInput, creatorId?: number): Promise<ListStudentsResult> {
    const { page, per_page, keyword, status, location, login_status } = input;

    const { students, total } = await this.studentRepository.findMany({
      page,
      perPage: per_page,
      keyword,
      status,
      location,
      loginStatus: login_status,
      creatorId,
    });

    const data = students.map((s) => s.toResponseObject());
    const pagination = buildPaginationMeta(page, per_page, total);

    return {
      data,
      pagination,
    };
  }
}

