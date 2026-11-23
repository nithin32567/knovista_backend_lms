export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export function buildPaginationMeta(page: number, perPage: number, total: number): PaginationMeta {
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const from = total > 0 ? (page - 1) * perPage + 1 : null;
  const to = total > 0 ? Math.min(page * perPage, total) : null;

  return {
    current_page: page,
    last_page: lastPage,
    per_page: perPage,
    total,
    from,
    to,
  };
}

