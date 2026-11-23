export interface StudentSectionModuleProps {
  id: number;
  studentSectionId: number;
  moduleId: number;
  status: string;
  unlockRequested: boolean;
  marksScored?: number | null | undefined;
  totalMarks?: number | null | undefined;
  percentage?: number | null | undefined;
  remarks?: string | null | undefined;
  evaluatedBy?: number | null | undefined;
  evaluatedAt?: Date | null | undefined;
  createdAt: Date | null;
  updatedAt: Date | null;
  moduleName?: string | undefined;
}

export class StudentSectionModule {
  constructor(private readonly props: StudentSectionModuleProps) {}

  get id(): number { return this.props.id; }
  get studentSectionId(): number { return this.props.studentSectionId; }
  get moduleId(): number { return this.props.moduleId; }
  get status(): string { return this.props.status; }
  get unlockRequested(): boolean { return this.props.unlockRequested; }
  get marksScored(): number | null | undefined { return this.props.marksScored; }
  get totalMarks(): number | null | undefined { return this.props.totalMarks; }
  get percentage(): number | null | undefined { return this.props.percentage; }
  get remarks(): string | null | undefined { return this.props.remarks; }
  get evaluatedBy(): number | null | undefined { return this.props.evaluatedBy; }
  get evaluatedAt(): Date | null | undefined { return this.props.evaluatedAt; }
  get createdAt(): Date | null { return this.props.createdAt; }
  get updatedAt(): Date | null { return this.props.updatedAt; }
  get moduleName(): string | undefined { return this.props.moduleName; }

  toResponseObject() {
    return {
      id: this.id,
      student_section_id: this.studentSectionId,
      module_id: this.moduleId,
      status: this.status,
      unlock_requested: this.unlockRequested,
      marks_scored: this.marksScored ?? null,
      total_marks: this.totalMarks ?? null,
      percentage: this.percentage ?? null,
      remarks: this.remarks ?? null,
      evaluated_by: this.evaluatedBy ?? null,
      evaluated_at: this.evaluatedAt ? this.evaluatedAt.toISOString() : null,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
      updated_at: this.updatedAt ? this.updatedAt.toISOString() : null,
      module_name: this.moduleName ?? null,
    };
  }
}

