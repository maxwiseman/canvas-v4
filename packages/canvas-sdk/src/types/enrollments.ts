/**
 * Types for the Canvas Enrollments API.
 *
 * @see https://canvas.instructure.com/doc/api/enrollments.html
 * @module types/enrollments
 */

import type { CourseId, EnrollmentId, ISO8601, SectionId, UserId } from "./common";

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

/**
 * The role of an enrollment.
 *
 * - `"StudentEnrollment"` — a student.
 * - `"TeacherEnrollment"` — the primary instructor.
 * - `"TaEnrollment"` — a teaching assistant.
 * - `"DesignerEnrollment"` — a course designer.
 * - `"ObserverEnrollment"` — a parent/guardian observing a student.
 */
export type EnrollmentType =
  | "StudentEnrollment"
  | "TeacherEnrollment"
  | "TaEnrollment"
  | "DesignerEnrollment"
  | "ObserverEnrollment";

/**
 * Workflow state of an enrollment.
 *
 * - `"active"` — the enrollment is live.
 * - `"invited"` — the user has been invited but has not accepted.
 * - `"inactive"` — the enrollment is disabled.
 * - `"completed"` — the course term has ended.
 * - `"rejected"` — the invitation was rejected.
 * - `"deleted"` — the enrollment was deleted.
 */
export type EnrollmentState =
  | "active"
  | "invited"
  | "inactive"
  | "completed"
  | "rejected"
  | "deleted";

// ---------------------------------------------------------------------------
// Sub-objects
// ---------------------------------------------------------------------------

/**
 * Grade information for an enrollment.
 * Present only when `include[]=grades` is requested.
 */
export interface Grades {
  /** URL to the student's grades page in Canvas. */
  html_url: string;
  /** Current score (percentage), or `null`. */
  current_score: number | null;
  /** Final score (percentage), or `null`. */
  final_score: number | null;
  /** Current letter grade, or `null`. */
  current_grade: string | null;
  /** Final letter grade, or `null`. */
  final_grade: string | null;
  /** Override score, if any. */
  override_score?: number | null | undefined;
  /** Override grade, if any. */
  override_grade?: string | null | undefined;
  /** Current score for the current grading period. */
  current_period_computed_current_score?: number | null | undefined;
  /** Final score for the current grading period. */
  current_period_computed_final_score?: number | null | undefined;
  /** Current grade for the current grading period. */
  current_period_computed_current_grade?: string | null | undefined;
  /** Final grade for the current grading period. */
  current_period_computed_final_grade?: string | null | undefined;
}

// ---------------------------------------------------------------------------
// Core type
// ---------------------------------------------------------------------------

/**
 * A Canvas enrollment — the link between a user and a course.
 */
export interface Enrollment {
  /** Unique numeric identifier. */
  id: EnrollmentId;
  /** ID of the course. */
  course_id: CourseId;
  /** SIS course ID, if any. */
  sis_course_id?: string | null | undefined;
  /** Canvas course integration ID, if any. */
  course_integration_id?: string | null | undefined;
  /** ID of the course section. */
  course_section_id: SectionId;
  /** Section integration ID, if any. */
  section_integration_id?: string | null | undefined;
  /** SIS account ID, if any. */
  sis_account_id?: string | null | undefined;
  /** SIS section ID, if any. */
  sis_section_id?: string | null | undefined;
  /** SIS user ID, if any. */
  sis_user_id?: string | null | undefined;
  /** Workflow state of this enrollment. */
  enrollment_state: EnrollmentState;
  /** Whether this enrollment limits certain course-level privileges. */
  limit_privileges_to_course_section: boolean;
  /** SIS import ID, if any. */
  sis_import_id?: number | null | undefined;
  /** ID of the root account. */
  root_account_id: number;
  /**
   * The enrollment type.
   * @see {@link EnrollmentType}
   */
  type: EnrollmentType;
  /** ID of the enrolled user. */
  user_id: UserId;
  /** User ID of the associated observer's target student. */
  associated_user_id?: UserId | null | undefined;
  /** The name of the enrollment role. */
  role: string;
  /** ID of the enrollment role. */
  role_id: number;
  /** ISO 8601 creation timestamp. */
  created_at: ISO8601;
  /** ISO 8601 last-updated timestamp. */
  updated_at: ISO8601;
  /** ISO 8601 timestamp when the student first attended the course. */
  start_at?: ISO8601 | null | undefined;
  /** ISO 8601 timestamp when the enrollment ends. */
  end_at?: ISO8601 | null | undefined;
  /** ISO 8601 last activity timestamp for this enrollment. */
  last_activity_at?: ISO8601 | null | undefined;
  /** ISO 8601 timestamp of last attendance. */
  last_attended_at?: ISO8601 | null | undefined;
  /** Total time (seconds) the student has spent in the course. */
  total_activity_time?: number | undefined;
  /** URL to the HTML view of this enrollment. */
  html_url: string;
  /**
   * Grade information.
   * Present only when `include[]=grades`.
   */
  grades?: Grades | undefined;
  /**
   * The user object of the enrolled person.
   * Present only when `include[]=user`.
   */
  user?: unknown | undefined;
  /** Override grade from the gradebook. */
  override_grade?: string | null | undefined;
  /** Override score from the gradebook. */
  override_score?: number | null | undefined;
  /** Final grade override. */
  unposted_current_grade?: string | null | undefined;
  /** Unposted current score. */
  unposted_current_score?: number | null | undefined;
  /** Unposted final grade. */
  unposted_final_grade?: string | null | undefined;
  /** Unposted final score. */
  unposted_final_score?: number | null | undefined;
  /** Whether course analytics are available for this enrollment. */
  has_grading_periods?: boolean | undefined;
  /** Whether totals for all grading periods are visible. */
  totals_for_all_grading_periods_option?: boolean | undefined;
  /** Current grading period title. */
  current_grading_period_title?: string | undefined;
  /** Current grading period ID. */
  current_grading_period_id?: number | undefined;
  /** Score for the current grading period. */
  current_period_override_grade?: string | null | undefined;
  /** Override score for the current grading period. */
  current_period_override_score?: number | null | undefined;
  /** Computed current score for the current grading period. */
  current_period_computed_current_score?: number | null | undefined;
  /** Computed final score for the current grading period. */
  current_period_computed_final_score?: number | null | undefined;
  /** Computed current grade for the current grading period. */
  current_period_computed_current_grade?: string | null | undefined;
  /** Computed final grade for the current grading period. */
  current_period_computed_final_grade?: string | null | undefined;
}

// ---------------------------------------------------------------------------
// Request parameter types
// ---------------------------------------------------------------------------

/**
 * Parameters accepted by `GET /courses/:course_id/enrollments`.
 */
export interface ListEnrollmentsParams {
  /**
   * Additional fields to include.
   *
   * Common values:
   * - `"avatar_url"` — student avatar
   * - `"group_ids"` — group IDs the user belongs to
   * - `"locked"` — whether the enrollment is locked
   * - `"observed_users"` — for observer enrollments
   * - `"can_be_removed"` — whether the enrollment can be deleted
   * - `"uuid"` — user UUID
   * - `"current_points"` — current points earned
   */
  include?: string[] | undefined;
  /** Filter by enrollment type. */
  type?: EnrollmentType[] | undefined;
  /** Filter by enrollment state. */
  state?: EnrollmentState[] | undefined;
  /** Limit to a specific SIS account. */
  sis_account_id?: string[] | undefined;
  /** Limit to a specific SIS course. */
  sis_course_id?: string[] | undefined;
  /** Limit to a specific SIS section. */
  sis_section_id?: string[] | undefined;
  /** Limit to a specific SIS user. */
  sis_user_id?: string[] | undefined;
  /** Whether to include created_by_sis. */
  created_for_sis_id?: string[] | undefined;
  /** Number of results per page. */
  per_page?: number | undefined;
}

/**
 * Parameters accepted by `POST /courses/:course_id/enrollments` (enroll a user).
 */
export interface EnrollUserParams {
  enrollment: {
    /** ID of the user to enroll (required). */
    user_id: UserId | "self";
    /**
     * Enrollment type.
     * @default "StudentEnrollment"
     */
    type?: EnrollmentType | undefined;
    /** Role name or ID. */
    role?: string | undefined;
    /** Role ID. */
    role_id?: number | undefined;
    /**
     * Initial enrollment state.
     * @default "invited"
     */
    enrollment_state?: "active" | "invited" | "inactive" | undefined;
    /** Course section ID to enroll into. */
    course_section_id?: SectionId | undefined;
    /** Whether to limit privileges to the course section. */
    limit_privileges_to_course_section?: boolean | undefined;
    /** Whether to send an enrollment notification. */
    notify?: boolean | undefined;
    /** Self-enrollment code (for self-enrollment). */
    self_enrollment_code?: string | undefined;
    /** Whether to enroll via self-enrollment. */
    self_enrolled?: boolean | undefined;
    /** Associated student user ID (for observer enrollments). */
    associated_user_id?: UserId | undefined;
  };
}
