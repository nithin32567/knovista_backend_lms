export const CONTENT_ENROLLMENT_STATUSES = ['Active', 'active', 'Completed', 'completed'] as const;
export const CONTENT_MODULE_STATUSES = ['Unlocked', 'unlocked', 'Active', 'active', 'Completed', 'completed'] as const;

interface CourseBatch {
  id: number;
  section_id: number;
  program_id: number;
  name: string;
  tutor_id: number | null;
  quality_analyst_id: number | null;
  placement_officer_id: number | null;
  batch_start_date: Date | null;
  batch_end_date: Date | null;
  status: string;
  created_by: number;
  updated_by: number;
  created_at: Date | null;
  updated_at: Date | null;
}

interface CourseEnrollment {
  expected_start_date: Date | null;
  expected_end_date: Date | null;
  actual_start_date: null;
  actual_end_date: null;
  student_section_status: string;
  batch: CourseBatch;
}

export interface StudentCourseSummary extends CourseEnrollment {
  section_id: number;
  section_code: string | null;
  section_name: string;
  section_duration: string | number | null;
  section_amount: string | null;
  section_status: string;
  cover_image: string | null;
}

interface CourseQuestion {
  id: number;
  question: string;
  options: string;
  priority: number;
  status: string;
}

interface CourseTopic {
  student_topic_id: number;
  topic_id: number;
  name: string;
  type: string;
  file_url: string | null;
  day_count: number | null;
  cover_image: string | null;
  priority: number;
  status: string;
  student_topic_status: string;
  topic_started_at: Date | null;
  topic_last_accessed_at: Date | null;
  topic_completed_at: Date | null;
  assessments: CourseQuestion[];
}

interface CourseModule {
  module_id: number;
  name: string;
  priority: number;
  status: string;
  student_module_status: string;
  unlock_requested_at: Date | null;
  unlocked_at: Date | null;
  topics: CourseTopic[];
}

export interface StudentCourseDetails {
  section: CourseEnrollment & {
    code: string | null;
    name: string;
    duration: string | number | null;
    amount: string | null;
    status: string;
  };
  modules: CourseModule[];
}

export interface IStudentCourseRepository {
  listByStudent(studentId: number): Promise<StudentCourseSummary[]>;
  findByStudentAndSection(studentId: number, sectionId: number): Promise<StudentCourseDetails | null>;
}
