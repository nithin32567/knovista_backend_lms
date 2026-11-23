export interface ModuleUnlockRequestProps {
  studentSectionModuleId: number;
  studentId: number;
  studentSectionId: number;
  moduleId: number;
  moduleName?: string | undefined;
  modulePriority?: number | undefined;
  status: string;
  unlockRequested: boolean;
  unlockRequestedBy?: number | null | undefined;
  unlockRequestedAt?: Date | null | undefined;
  unlockedBy?: number | null | undefined;
  unlockedAt?: Date | null | undefined;
  studentFirstName?: string | undefined;
  studentLastName?: string | undefined;
  studentEmail?: string | undefined;
  studentMobile?: string | undefined;
  loginStatus?: boolean | undefined;
  batchId?: number | undefined;
  batchName?: string | undefined;
  sectionId?: number | undefined;
  sectionName?: string | undefined;
  programName?: string | undefined;
}

export class ModuleUnlockRequest {
  constructor(private readonly props: ModuleUnlockRequestProps) {}

  get studentSectionModuleId(): number { return this.props.studentSectionModuleId; }
  get studentId(): number { return this.props.studentId; }
  get studentSectionId(): number { return this.props.studentSectionId; }
  get moduleId(): number { return this.props.moduleId; }
  get moduleName(): string | undefined { return this.props.moduleName; }
  get modulePriority(): number | undefined { return this.props.modulePriority; }
  get status(): string { return this.props.status; }
  get unlockRequested(): boolean { return this.props.unlockRequested; }
  get unlockRequestedBy(): number | null | undefined { return this.props.unlockRequestedBy; }
  get unlockRequestedAt(): Date | null | undefined { return this.props.unlockRequestedAt; }
  get unlockedBy(): number | null | undefined { return this.props.unlockedBy; }
  get unlockedAt(): Date | null | undefined { return this.props.unlockedAt; }
  get studentFirstName(): string | undefined { return this.props.studentFirstName; }
  get studentLastName(): string | undefined { return this.props.studentLastName; }
  get studentEmail(): string | undefined { return this.props.studentEmail; }
  get studentMobile(): string | undefined { return this.props.studentMobile; }
  get loginStatus(): boolean | undefined { return this.props.loginStatus; }
  get batchId(): number | undefined { return this.props.batchId; }
  get batchName(): string | undefined { return this.props.batchName; }
  get sectionId(): number | undefined { return this.props.sectionId; }
  get sectionName(): string | undefined { return this.props.sectionName; }
  get programName(): string | undefined { return this.props.programName; }

  toResponseObject() {
    return {
      student_section_module_id: this.studentSectionModuleId,
      student_id: this.studentId,
      student_section_id: this.studentSectionId,
      module_id: this.moduleId,
      module_name: this.moduleName ?? null,
      module_priority: this.modulePriority ?? null,
      status: this.status,
      unlock_requested: this.unlockRequested,
      unlock_requested_by: this.unlockRequestedBy ?? null,
      unlock_requested_at: this.unlockRequestedAt ? this.unlockRequestedAt.toISOString() : null,
      unlocked_by: this.unlockedBy ?? null,
      unlocked_at: this.unlockedAt ? this.unlockedAt.toISOString() : null,
      student: {
        id: this.studentId,
        first_name: this.studentFirstName ?? null,
        last_name: this.studentLastName ?? null,
        email: this.studentEmail ?? null,
        mobile_no: this.studentMobile ?? null,
        login_status: this.loginStatus ?? false,
      },
      batch: this.batchId ? {
        id: this.batchId,
        name: this.batchName ?? null,
      } : null,
      section: this.sectionId ? {
        id: this.sectionId,
        name: this.sectionName ?? null,
      } : null,
      program: this.programName ? {
        name: this.programName,
      } : null,
    };
  }
}

