import { ModulePerformance } from '../entities/ModulePerformance';

export interface ListPerformanceFilter {
  studentId?: number | undefined;
  studentSectionId?: number | undefined;
  batchId?: number | undefined;
  sectionId?: number | undefined;
  moduleId?: number | undefined;
  performance?: string | undefined;
  onlyWithPerformance?: boolean | undefined;
}

export interface StudentModulePerformanceDetail {
  moduleId: number;
  moduleName: string;
  modulePriority: number;
  moduleStatus: string;
  sectionId: number;
  sectionName: string | null;
  performance: {
    studentSectionModuleId: number;
    studentSectionId: number;
    status: string;
    performance: string | null;
    performanceDescription: string | null;
    performanceCreatedBy: number | null;
    performanceCreatedAt: string | null;
  } | null;
}

export interface StudentModulePerformanceResult {
  student: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    mobileNo: string | null;
  };
  modules: StudentModulePerformanceDetail[];
}

export interface CompletedModuleItem {
  id: number;
  studentId: number;
  studentSectionId: number;
  moduleId: number;
  moduleName: string;
  completedAt: string | null;
}

export interface IPerformanceRepository {
  savePerformance(
    studentSectionModuleId: number,
    performance: string,
    description: string | null,
    userId: number
  ): Promise<ModulePerformance | null>;
  getPerformanceById(id: number): Promise<ModulePerformance | null>;
  clearPerformance(id: number): Promise<boolean>;
  listPerformances(filters: ListPerformanceFilter): Promise<{ items: ModulePerformance[]; isCertificate: boolean }>;
  getStudentModulePerformance(studentId: number): Promise<StudentModulePerformanceResult | null>;
  getCompletedModules(studentId: number, studentSectionId?: number | undefined): Promise<CompletedModuleItem[]>;
}

