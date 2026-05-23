/**
 * Types for the Canvas Courses API.
 *
 * @see https://canvas.instructure.com/doc/api/courses.html
 * @module types/courses
 */

import type {
  CourseId,
  GradingPeriod,
  ISO8601,
  Term,
  UserId,
} from "./common";

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

/**
 * Workflow state of a course.
 *
 * - `"unpublished"` — course is in draft; students cannot access it.
 * - `"available"` — course is live and accessible.
 * - `"completed"` — the course term has ended.
 * - `"deleted"` — the course has been deleted.
 */
export type CourseWorkflowState =
  | "unpublished"
  | "available"
  | "completed"
  | "deleted";

/**
 * The default view shown on a course's home page.
 */
export type CourseDefaultView =
  | "feed"
  | "wiki"
  | "modules"
  | "assignments"
  | "syllabus";

/**
 * The license applied to course content.
 */
export type CourseLicense =
  | "private"
  | "public_domain"
  | "cc_by"
  | "cc_by_sa"
  | "cc_by_nd"
  | "cc_by_nc"
  | "cc_by_nc_sa"
  | "cc_by_nc_nd";

// ---------------------------------------------------------------------------
// Sub-objects
// ---------------------------------------------------------------------------

/**
 * Blueprint course content restrictions.
 */
export interface BlueprintRestrictions {
  /** Whether course content (pages, assignments, etc.) is locked. */
  content: boolean;
  /** Whether assignment/quiz points are locked. */
  points: boolean;
  /** Whether due dates are locked. */
  due_dates: boolean;
  /** Whether availability dates are locked. */
  availability_dates: boolean;
}

/**
 * Student-facing progress through a course with completion requirements.
 */
export interface CourseProgress {
  /** Total number of completion requirements in the course. */
  requirement_count: number;
  /** Number of requirements the student has completed. */
  requirement_completed_count: number;
  /** URL of the next incomplete requirement, or `null` if complete. */
  next_requirement_url: string | null;
  /** ISO 8601 timestamp when the student completed the course, or `null`. */
  completed_at: ISO8601 | null;
}

/**
 * A minimal teacher/instructor representation embedded in a course response.
 */
export interface CourseTeacher {
  /** Unique identifier. */
  id: UserId;
  /** Display name. */
  display_name: string;
  /** Avatar image URL. */
  avatar_image_url: string;
  /** URL to the instructor's Canvas profile. */
  html_url: string;
  /** Pronouns, if set. */
  pronouns: string | null;
  /** Opaque random identifier. */
  anonymous_id?: string | undefined;
}

/**
 * A grading standard applied to a course.
 */
export interface GradingStandard {
  /** Unique identifier. */
  id: number;
  /** Human-readable title. */
  title: string;
  /** Canvas object type (always `"course"` or `"account"`). */
  context_type: "course" | "account";
  /** ID of the owning context. */
  context_id: number;
  /** Grading scale entries, sorted from highest to lowest. */
  grading_scheme: Array<{ name: string; value: number }>;
}

/**
 * Score statistics for a course's assignments (included via `include[]=total_scores`).
 */
export interface CourseScoreStatistics {
  mean: number;
  minimum: number;
  maximum: number;
}

// ---------------------------------------------------------------------------
// Core type
// ---------------------------------------------------------------------------

/**
 * A Canvas course object.
 *
 * Many fields are only present when explicitly requested via `include[]`
 * parameters on the list/get endpoints.
 */
export interface Course {
  /** Unique numeric identifier. */
  id: CourseId;
  /** SIS course ID, if any. */
  sis_course_id: string | null;
  /** UUID for the course. */
  uuid: string;
  /** Integration ID, if any. */
  integration_id: string | null;
  /** SIS import ID, if any. */
  sis_import_id: number | null;
  /** Full course name. */
  name: string;
  /** Short course code (e.g. `"CS101"`). */
  course_code: string;
  /** Original course name before any nickname has been applied. */
  original_name?: string | undefined;
  /**
   * Current workflow state of the course.
   * @see {@link CourseWorkflowState}
   */
  workflow_state: CourseWorkflowState;
  /** ID of the account that owns this course. */
  account_id: number;
  /** ID of the root account. */
  root_account_id: number;
  /** ID of the enrollment term this course belongs to. */
  enrollment_term_id: number;
  /**
   * Grading periods for the course.
   * Present only when `include[]=grading_periods` is passed.
   */
  grading_periods?: GradingPeriod[] | null | undefined;
  /** ID of the grading standard applied to this course. */
  grading_standard_id: number | null;
  /** Grade passback setting. */
  grade_passback_setting: string | null;
  /** ISO 8601 creation timestamp. */
  created_at: ISO8601;
  /** ISO 8601 course start date, or `null`. */
  start_at: ISO8601 | null;
  /** ISO 8601 course end date, or `null`. */
  end_at: ISO8601 | null;
  /** Locale setting for the course. */
  locale: string;
  /**
   * The current user's enrollments in this course.
   * Present only when `include[]=enrollments` or when listing a user's courses.
   */
  enrollments?: Array<{
    type: string;
    role: string;
    role_id: number;
    user_id: UserId;
    enrollment_state: string;
  }> | null | undefined;
  /**
   * Total number of enrolled students.
   * Present only when `include[]=total_students`.
   */
  total_students?: number | undefined;
  /** Link to the course calendar. */
  calendar?: { ics: string } | undefined;
  /** Default view shown on the course home page. */
  default_view: CourseDefaultView;
  /** HTML body of the course syllabus. `null` if no syllabus is set. */
  syllabus_body?: string | null | undefined;
  /**
   * Number of assignments needing grading (instructor view only).
   * Present only when `include[]=needs_grading_count`.
   */
  needs_grading_count?: number | undefined;
  /**
   * Enrollment term information.
   * Present only when `include[]=term`.
   */
  term?: Term | null | undefined;
  /**
   * Student progress through the course.
   * Present only when `include[]=course_progress`.
   */
  course_progress?: CourseProgress | null | undefined;
  /** Whether assignment group weights are applied. */
  apply_assignment_group_weights: boolean;
  /** Map of permission names to boolean values. */
  permissions?: Record<string, boolean> | undefined;
  /** Whether the course content is publicly visible. */
  is_public: boolean;
  /** Whether the course is visible to authenticated (logged-in) users. */
  is_public_to_auth_users: boolean;
  /** Whether the syllabus is publicly visible. */
  public_syllabus: boolean;
  /** Whether the syllabus is visible to authenticated users. */
  public_syllabus_to_auth: boolean;
  /** Public description of the course. */
  public_description: string | null;
  /** Storage quota in MB. */
  storage_quota_mb: number;
  /** Used storage in MB. */
  storage_quota_used_mb?: number | undefined;
  /** Whether final grades are hidden from students. */
  hide_final_grades: boolean;
  /** Content license. */
  license?: CourseLicense | string | undefined;
  /** Whether students can edit wiki pages. */
  allow_student_assignment_edits: boolean;
  /** Whether wiki comments are enabled. */
  allow_wiki_comments: boolean;
  /** Whether students can attach files to forum posts. */
  allow_student_forum_attachments: boolean;
  /** Whether open enrollment is enabled. */
  open_enrollment: boolean;
  /** Whether self-enrollment is enabled. */
  self_enrollment: boolean;
  /** Whether enrollments are restricted to course dates. */
  restrict_enrollments_to_course_dates: boolean;
  /** Course format (e.g. `"on_campus"`, `"online"`, `"blended"`). */
  course_format?: string | undefined;
  /** Whether course access is restricted by date. */
  access_restricted_by_date?: boolean | undefined;
  /** IANA time zone identifier for the course. */
  time_zone: string;
  /** Whether this is a blueprint course. */
  blueprint: boolean;
  /** Content restrictions for blueprint courses. */
  blueprint_restrictions?: BlueprintRestrictions | undefined;
  /** Per-object-type blueprint restrictions. */
  blueprint_restrictions_by_object_type?: Record<
    string,
    BlueprintRestrictions
  > | undefined;
  /** Whether this is a course template. */
  template: boolean;
  /**
   * Instructor list.
   * Present only when `include[]=teachers`.
   */
  teachers?: CourseTeacher[] | undefined;
  /**
   * Outcome-based rubric criteria.
   * Present only when `include[]=observed_users`.
   */
  observed_users?: unknown[] | undefined;
  /** Whether the course is concluded. */
  concluded?: boolean | undefined;
  /** Whether quantitative data (points) is restricted. */
  restrict_quantitative_data?: boolean | undefined;
}

// ---------------------------------------------------------------------------
// Request parameter types
// ---------------------------------------------------------------------------

/**
 * Parameters accepted by `GET /courses` (list courses for the current user).
 */
export interface ListCoursesParams {
  /**
   * Include additional data in the response.
   *
   * Common values:
   * - `"needs_grading_count"` — number of submissions to grade (instructors only)
   * - `"syllabus_body"` — course syllabus HTML
   * - `"public_description"` — public description
   * - `"total_scores"` — final and current scores (students only)
   * - `"current_grading_period_scores"` — scores for the current grading period
   * - `"term"` — enrollment term
   * - `"course_progress"` — course progress details
   * - `"sections"` — sections the current user is enrolled in
   * - `"storage_quota_used_mb"` — used storage
   * - `"total_students"` — number of students
   * - `"passback_status"` — passback status
   * - `"favorites"` — whether the course is a favorite
   * - `"teachers"` — course teachers
   * - `"observed_users"` — users being observed
   * - `"tabs"` — course navigation tabs
   * - `"enrollments"` — enrollments
   * - `"grading_periods"` — grading periods
   */
  include?: string[] | undefined;
  /**
   * Filter by enrollment state.
   * @default "active"
   */
  enrollment_state?:
    | "active"
    | "invited_or_pending"
    | "completed"
    | undefined;
  /** Filter by enrollment type. */
  enrollment_type?:
    | "teacher"
    | "student"
    | "ta"
    | "observer"
    | "designer"
    | undefined;
  /** Only return homeroom courses. */
  homeroom?: boolean | undefined;
  /** Filter to courses with a specific course state. */
  state?: CourseWorkflowState[] | undefined;
  /** Number of results per page. */
  per_page?: number | undefined;
}

/**
 * Parameters accepted by `GET /courses/:id`.
 */
export interface GetCourseParams {
  /** Additional fields to include (see {@link ListCoursesParams.include}). */
  include?: string[] | undefined;
  /** ID of the teacher to return (defaults to current user). */
  teacher_limit?: number | undefined;
}

/**
 * Parameters accepted by `PUT /courses/:id` (update a course).
 */
export interface UpdateCourseParams {
  course?: {
    name?: string | undefined;
    course_code?: string | undefined;
    start_at?: ISO8601 | undefined;
    end_at?: ISO8601 | undefined;
    license?: string | undefined;
    is_public?: boolean | undefined;
    is_public_to_auth_users?: boolean | undefined;
    public_syllabus?: boolean | undefined;
    public_syllabus_to_auth?: boolean | undefined;
    public_description?: string | undefined;
    allow_student_wiki_edits?: boolean | undefined;
    allow_wiki_comments?: boolean | undefined;
    allow_student_forum_attachments?: boolean | undefined;
    open_enrollment?: boolean | undefined;
    self_enrollment?: boolean | undefined;
    restrict_enrollments_to_course_dates?: boolean | undefined;
    hide_final_grades?: boolean | undefined;
    apply_assignment_group_weights?: boolean | undefined;
    time_zone?: string | undefined;
    default_view?: CourseDefaultView | undefined;
    syllabus_body?: string | undefined;
    grading_standard_id?: number | undefined;
    course_format?: string | undefined;
    image_id?: string | undefined;
    image_url?: string | undefined;
    remove_image?: boolean | undefined;
    blueprint?: boolean | undefined;
    blueprint_restrictions?: BlueprintRestrictions | undefined;
    blueprint_restrictions_by_object_type?: Record<
      string,
      BlueprintRestrictions
    > | undefined;
    use_blueprint_restrictions_by_object_type?: boolean | undefined;
  } | undefined;
  /** Override for offering. */
  offer?: boolean | undefined;
}

/**
 * Parameters accepted by `POST /accounts/:account_id/courses` (create a course).
 */
export interface CreateCourseParams {
  course: {
    /** Course name (required). */
    name: string;
    /** Course code. */
    course_code?: string | undefined;
    start_at?: ISO8601 | undefined;
    end_at?: ISO8601 | undefined;
    license?: string | undefined;
    is_public?: boolean | undefined;
    is_public_to_auth_users?: boolean | undefined;
    public_syllabus?: boolean | undefined;
    public_syllabus_to_auth?: boolean | undefined;
    public_description?: string | undefined;
    allow_student_wiki_edits?: boolean | undefined;
    allow_wiki_comments?: boolean | undefined;
    allow_student_forum_attachments?: boolean | undefined;
    open_enrollment?: boolean | undefined;
    self_enrollment?: boolean | undefined;
    restrict_enrollments_to_course_dates?: boolean | undefined;
    term_id?: number | undefined;
    sis_course_id?: string | undefined;
    integration_id?: string | undefined;
    hide_final_grades?: boolean | undefined;
    apply_assignment_group_weights?: boolean | undefined;
    time_zone?: string | undefined;
    default_view?: CourseDefaultView | undefined;
    syllabus_body?: string | undefined;
    grading_standard_id?: number | undefined;
    course_format?: string | undefined;
    template?: boolean | undefined;
  };
  /** Enroll the current user as a teacher. */
  enroll_me?: boolean | undefined;
  /** Offer the course immediately after creation. */
  offer?: boolean | undefined;
}

/**
 * Parameters accepted by `GET /courses/:id/settings`.
 */
export interface CourseSettings {
  allow_student_discussion_topics: boolean;
  allow_student_forum_attachments: boolean;
  allow_student_discussion_editing: boolean;
  allow_student_organized_groups: boolean;
  allow_student_discussion_reporting: boolean;
  allow_student_anonymous_discussion_topics: boolean;
  filter_speed_grader_by_student_group: boolean;
  grading_standard_enabled: boolean;
  grading_standard_id?: number | undefined;
  allow_student_wiki_edits: boolean;
  show_total_grade_as_points: boolean;
  lock_all_announcements: boolean;
  usage_rights_required: boolean;
  restrict_student_past_view: boolean;
  restrict_student_future_view: boolean;
  restrict_quantitative_data: boolean;
  show_announcements_on_home_page: boolean;
  home_page_announcement_limit: number;
  syllabus_course_summary: boolean;
  homeroom_course: boolean;
  image_id?: string | undefined;
  image_url?: string | undefined;
  banner_image_id?: string | undefined;
  banner_image_url?: string | undefined;
  course_color?: string | undefined;
  friendly_name?: string | undefined;
}

/**
 * An assignment group within a course.
 */
export interface AssignmentGroup {
  /** Unique identifier. */
  id: number;
  /** Name of the group (e.g. "Homework", "Exams"). */
  name: string;
  /** Display position (1-indexed, lowest = first). */
  position: number;
  /** Percentage weight applied to this group's grades (0–100). */
  group_weight: number;
  /** SIS source ID. */
  sis_source_id?: string | undefined;
  /** Integration data. */
  integration_data?: unknown | undefined;
  /** Assignments in this group (present when `include[]=assignments`). */
  assignments?: unknown[] | undefined;
  /** Grading rules applied to this group. */
  rules?: {
    drop_lowest?: number | undefined;
    drop_highest?: number | undefined;
    never_drop?: number[] | undefined;
  } | undefined;
}
