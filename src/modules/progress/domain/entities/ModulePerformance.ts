export interface ModulePerformanceProps {
  studentSectionModuleId: number;
  studentId: number;
  studentSectionId: number;
  moduleId: number;
  moduleName?: string | undefined;
  modulePriority?: number | undefined;
  status?: string | undefined;
  performance?: string | null | undefined;
  performanceDescription?: string | null | undefined;
  performanceCreatedBy?: number | null | undefined;
  performanceCreatedAt?: Date | null | undefined;
  studentFirstName?: string | undefined;
  studentLastName?: string | undefined;
  studentEmail?: string | undefined;
  studentMobile?: string | undefined;
  batchId?: number | undefined;
  batchName?: string | undefined;
  sectionId?: number | undefined;
  sectionName?: string | undefined;
  selfPlaced?: string | null | undefined;
  updatedAt?: Date | null | undefined;
}

export class ModulePerformance {
  constructor(private readonly props: ModulePerformanceProps) {}

  get studentSectionModuleId(): number { return this.props.studentSectionModuleId; }
  get studentId(): number { return this.props.studentId; }
  get studentSectionId(): number { return this.props.studentSectionId; }
  get moduleId(): number { return this.props.moduleId; }
  get moduleName(): string | undefined { return this.props.moduleName; }
  get modulePriority(): number | undefined { return this.props.modulePriority; }
  get status(): string | undefined { return this.props.status; }
  get performance(): string | null | undefined { return this.props.performance; }
  get performanceDescription(): string | null | undefined { return this.props.performanceDescription; }
  get performanceCreatedBy(): number | null | undefined { return this.props.performanceCreatedBy; }
  get performanceCreatedAt(): Date | null | undefined { return this.props.performanceCreatedAt; }
  get studentFirstName(): string | undefined { return this.props.studentFirstName; }
  get studentLastName(): string | undefined { return this.props.studentLastName; }
  get studentEmail(): string | undefined { return this.props.studentEmail; }
  get studentMobile(): string | undefined { return this.props.studentMobile; }
  get batchId(): number | undefined { return this.props.batchId; }
  get batchName(): string | undefined { return this.props.batchName; }
  get sectionId(): number | undefined { return this.props.sectionId; }
  get sectionName(): string | undefined { return this.props.sectionName; }
  get selfPlaced(): string | null | undefined { return this.props.selfPlaced; }
  get updatedAt(): Date | null | undefined { return this.props.updatedAt; }

  toResponseObject() {
    return {
      student_section_module_id: this.studentSectionModuleId,
      student_id: this.studentId,
      student: {
        id: this.studentId,
        first_name: this.studentFirstName ?? null,
        last_name: this.studentLastName ?? null,
        email: this.studentEmail ?? null,
        mobile_no: this.studentMobile ?? null,
      },
      batch_id: this.batchId ?? null,
      batch_name: this.batchName ?? null,
      section_id: this.sectionId ?? null,
      section_name: this.sectionName ?? null,
      self_placed_details: {
        self_placed: this.selfPlaced ?? null,
        updated_at: this.updatedAt ? this.updatedAt.toISOString() : null,
      },
      module_id: this.moduleId,
      module_name: this.moduleName ?? null,
      performance: this.performance ?? null,
      performance_description: this.performanceDescription ?? null,
      performance_created_by: this.performanceCreatedBy ?? null,
      performance_created_at: this.performanceCreatedAt ? this.performanceCreatedAt.toISOString() : null,
    };
  }
}

