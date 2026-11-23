export interface TicketStatusCounts {
  Closed: number;
  Open: number;
}

export interface ModuleUnlockStatusCounts {
  new: number;
  pending: number;
  active: number;
  completed: number;
}

export interface StatusWithRecent<T = unknown> {
  count: number;
  recent: T[];
}

export interface SuggestionsByStatus {
  new: StatusWithRecent;
  accepted: StatusWithRecent;
  rejected: StatusWithRecent;
  completed: StatusWithRecent;
}

export interface ExtensionRequestsByStatus {
  new: StatusWithRecent;
  accepted: StatusWithRecent;
  rejected: StatusWithRecent;
  completed: StatusWithRecent;
}

export interface StudentStatusByBatch {
  batch_id: number;
  batch_name: string;
  blocked_students: number;
  active_students: number;
  dropped_students: number;
}

export interface AdminDashboardStatsProps {
  total_students: number;
  total_batches: number;
  total_programs: number;
  total_tickets: number;
  ticket_status_counts: TicketStatusCounts;
  total_users: number;
  module_unlock_requests: number;
  module_unlock_status_counts: ModuleUnlockStatusCounts;
  suggestions: number;
  suggestions_by_status: SuggestionsByStatus;
  extension_requests: number;
  extension_requests_by_status: ExtensionRequestsByStatus;
  blocked_students: number;
  active_students: number;
  dropped_students: number;
  student_status_counts_by_batch: StudentStatusByBatch[];
}

export class AdminDashboardStats {
  constructor(public readonly props: AdminDashboardStatsProps) {}

  public toJSON(): AdminDashboardStatsProps {
    return { ...this.props };
  }
}

