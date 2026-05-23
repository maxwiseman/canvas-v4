/**
 * Types for the Canvas Assignments API.
 *
 * @see https://canvas.instructure.com/doc/api/assignments.html
 * @module types/assignments
 */

import type {
  AssignmentId,
  CourseId,
  ExternalToolTagAttributes,
  ISO8601,
  LockInfo,
  RubricCriterion,
  RubricSettings,
} from "./common";

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

/**
 * How the assignment is graded.
 *
 * - `"pass_fail"` — Complete/Incomplete.
 * - `"percent"` — Percentage score.
 * - `"letter_grade"` — A/B/C/D/F.
 * - `"gpa_scale"` — GPA scale.
 * - `"points"` — Numeric points.
 * - `"not_graded"` — Ungraded practice.
 */
export type GradingType =
  | "pass_fail"
  | "percent"
  | "letter_grade"
  | "gpa_scale"
  | "points"
  | "not_graded";

/**
 * How a student can submit an assignment.
 *
 * - `"discussion_topic"` — Responds in a discussion.
 * - `"online_quiz"` — Canvas quiz.
 * - `"on_paper"` — Physical submission (tracked in gradebook only).
 * - `"none"` — No submission required.
 * - `"external_tool"` — LTI external tool.
 * - `"online_text_entry"` — Rich text editor.
 * - `"online_url"` — URL submission.
 * - `"online_upload"` — File upload.
 * - `"media_recording"` — Audio/video recording.
 * - `"student_annotation"` — Annotation on an attached file.
 */
export type SubmissionType =
  | "discussion_topic"
  | "online_quiz"
  | "on_paper"
  | "none"
  | "external_tool"
  | "online_text_entry"
  | "online_url"
  | "online_upload"
  | "media_recording"
  | "student_annotation";

// ---------------------------------------------------------------------------
// Sub-objects
// ---------------------------------------------------------------------------

/**
 * A date override for an assignment (e.g. for a specific section or student).
 */
export interface AssignmentDate {
  /** ID of the override, or `null` for the base/default date. */
  id: number | null;
  /** Whether this is the default date row (no override). */
  base: boolean;
  /** Title describing who this date applies to (e.g. "Everyone else"). */
  title: string;
  /** ISO 8601 due date, or `null`. */
  due_at: ISO8601 | null;
  /** ISO 8601 unlock date, or `null`. */
  unlock_at: ISO8601 | null;
  /** ISO 8601 lock date, or `null`. */
  lock_at: ISO8601 | null;
}

/**
 * An assignment date override targeting a specific section or set of students.
 */
export interface AssignmentOverride {
  /** Unique identifier for this override. */
  id: number;
  /** ID of the assignment this override belongs to. */
  assignment_id: AssignmentId;
  /** Display title. */
  title: string;
  /** Student IDs targeted by this override, or `null` if section-targeted. */
  student_ids: number[] | null;
  /** Group ID targeted, or `null`. */
  group_id: number | null;
  /** Course section ID targeted, or `null`. */
  course_section_id: number | null;
  /** ISO 8601 due date. */
  due_at: ISO8601 | null;
  /** Whether the due date is an all-day event. */
  all_day: boolean;
  /** The date string for all-day events (YYYY-MM-DD). */
  all_day_date: string | null;
  /** ISO 8601 unlock date. */
  unlock_at: ISO8601 | null;
  /** ISO 8601 lock date. */
  lock_at: ISO8601 | null;
}

/**
 * Needs-grading count broken down by course section.
 */
export interface NeedsGradingCountBySection {
  /** Section ID. */
  section_id: string;
  /** Number of submissions awaiting a grade in this section. */
  needs_grading_count: number;
}

/**
 * Basic score statistics for an assignment.
 */
export interface ScoreStatistics {
  /** Minimum score achieved. */
  min: number;
  /** Maximum score achieved. */
  max: number;
  /** Mean (average) score. */
  mean: number;
  /** Upper quartile. */
  upper_q3?: number | undefined;
  /** Median. */
  median?: number | undefined;
  /** Lower quartile. */
  lower_q1?: number | undefined;
}

/**
 * Turnitin plagiarism-detection settings.
 */
export interface TurnitinSettings {
  originality_report_visibility:
    | "immediate"
    | "after_grading"
    | "after_due_date"
    | "never";
  s_paper_check: boolean;
  internet_check: boolean;
  journal_check: boolean;
  exclude_biblio: boolean;
  exclude_quoted: boolean;
  exclude_small_matches_type: "percent" | "words" | null;
  exclude_small_matches_value: number | null;
}

// ---------------------------------------------------------------------------
// Core type
// ---------------------------------------------------------------------------

/**
 * A Canvas assignment object.
 *
 * Fields marked optional are only present when explicitly requested via
 * `include[]` parameters or under certain permission levels.
 */
export interface Assignment {
  /** Unique numeric identifier. */
  id: AssignmentId;
  /** Assignment name / title. */
  name: string;
  /** HTML description of the assignment. `null` if no description is set. */
  description: string | null;
  /** ISO 8601 creation timestamp. */
  created_at: ISO8601;
  /** ISO 8601 last-updated timestamp. */
  updated_at: ISO8601;
  /** ISO 8601 due date, or `null` if undated. */
  due_at: ISO8601 | null;
  /** ISO 8601 date after which submissions are locked. */
  lock_at: ISO8601 | null;
  /** ISO 8601 date before which submissions are unavailable. */
  unlock_at: ISO8601 | null;
  /** Whether any due date overrides exist. */
  has_overrides: boolean;
  /**
   * All due dates (base + overrides).
   * Present only when `include[]=all_dates`.
   */
  all_dates?: AssignmentDate[] | null | undefined;
  /** ID of the course this assignment belongs to. */
  course_id: CourseId;
  /** URL to view the assignment in Canvas. */
  html_url: string;
  /** URL to download all submissions as a zip. */
  submissions_download_url?: string | undefined;
  /** ID of the assignment group this assignment belongs to. */
  assignment_group_id: number;
  /** Whether a due date is required (admin setting). */
  due_date_required: boolean;
  /** List of allowed file extensions for upload submissions. */
  allowed_extensions: string[];
  /** Maximum length of the assignment name. */
  max_name_length: number;
  /** Whether Turnitin is enabled. */
  turnitin_enabled?: boolean | undefined;
  /** Whether VeriCite is enabled. */
  vericite_enabled?: boolean | undefined;
  /** Turnitin configuration, if enabled. */
  turnitin_settings?: TurnitinSettings | null | undefined;
  /** Whether group members submit individually (vs. as a group). */
  grade_group_students_individually?: boolean | undefined;
  /** LTI external tool configuration. */
  external_tool_tag_attributes?: ExternalToolTagAttributes | null | undefined;
  /** Whether peer reviews are enabled. */
  peer_reviews: boolean;
  /** Whether peer reviews are automatically assigned. */
  automatic_peer_reviews: boolean;
  /** Number of peer reviews to assign per student. */
  peer_review_count?: number | undefined;
  /** ISO 8601 date when peer reviews are auto-assigned. */
  peer_reviews_assign_at?: ISO8601 | null | undefined;
  /** Whether group members review each other. */
  intra_group_peer_reviews?: boolean | undefined;
  /** Group category ID for group assignments. */
  group_category_id: number | null;
  /**
   * Number of submissions that need grading.
   * Only present for instructors when `include[]=needs_grading_count`.
   */
  needs_grading_count?: number | undefined;
  /**
   * Needs-grading count per section.
   * Only present when `include[]=needs_grading_count` and requesting by section.
   */
  needs_grading_count_by_section?: NeedsGradingCountBySection[] | undefined;
  /** Display order of this assignment within its group. */
  position: number;
  /** Whether to post grades to the SIS. */
  post_to_sis?: boolean | undefined;
  /** SIS integration ID. */
  integration_id?: string | null | undefined;
  /** Integration data. */
  integration_data?: Record<string, unknown> | undefined;
  /** Maximum points possible for this assignment. */
  points_possible: number;
  /**
   * Submission types accepted for this assignment.
   * @see {@link SubmissionType}
   */
  submission_types: SubmissionType[];
  /** Whether any submissions have been made. */
  has_submitted_submissions: boolean;
  /**
   * How the assignment is graded.
   * @see {@link GradingType}
   */
  grading_type: GradingType;
  /** ID of the grading standard applied, if any. */
  grading_standard_id: number | null;
  /** Whether the assignment is published. */
  published: boolean;
  /** Whether the assignment can be unpublished (i.e. no submissions yet). */
  unpublishable: boolean;
  /** Whether the assignment is only visible to students with overrides. */
  only_visible_to_overrides: boolean;
  /** Whether the assignment is locked for the current user. */
  locked_for_user: boolean;
  /** Details about why the assignment is locked. */
  lock_info?: LockInfo | null | undefined;
  /** Human-readable explanation of why the assignment is locked. */
  lock_explanation?: string | null | undefined;
  /** ID of the associated quiz, if this is a quiz assignment. */
  quiz_id?: number | null | undefined;
  /** Whether student names are anonymised in SpeedGrader. */
  anonymize_students?: boolean | undefined;
  /** Whether Respondus LockDown Browser is required. */
  require_lockdown_browser?: boolean | undefined;
  /** Whether this assignment appears on the important dates calendar. */
  important_dates?: boolean | undefined;
  /** Whether the assignment is muted in the gradebook. */
  muted?: boolean | undefined;
  /** Whether submissions are anonymous. */
  anonymous_submissions?: boolean | undefined;
  /** Whether moderated grading is enabled. */
  moderated_grading?: boolean | undefined;
  /** Number of graders for moderated grading. */
  grader_count?: number | undefined;
  /** User ID of the final grader for moderated assignments. */
  final_grader_id?: number | null | undefined;
  /** Whether grader comments are visible to other graders. */
  grader_comments_visible_to_graders?: boolean | undefined;
  /** Whether graders are anonymous to each other. */
  graders_anonymous_to_graders?: boolean | undefined;
  /** Whether grader names are visible to the final grader. */
  grader_names_visible_to_final_grader?: boolean | undefined;
  /** Whether anonymous grading is enabled. */
  anonymous_grading?: boolean | undefined;
  /** Number of allowed submission attempts (-1 = unlimited). */
  allowed_attempts: number;
  /** Whether grades are posted manually (not auto-posted). */
  post_manually?: boolean | undefined;
  /**
   * Score statistics across all submissions.
   * Present only when `include[]=score_statistics`.
   */
  score_statistics?: ScoreStatistics | null | undefined;
  /** Whether the current student can submit. */
  can_submit?: boolean | undefined;
  /** Whether to hide this assignment in the gradebook. */
  hide_in_gradebook?: boolean | undefined;
  /**
   * The current user's submission for this assignment.
   * Present only when `include[]=submission`.
   */
  submission?: unknown | undefined;
  /** Whether to use the rubric for grading. */
  use_rubric_for_grading?: boolean | undefined;
  /**
   * Rubric settings.
   * Present only when a rubric has been attached.
   */
  rubric_settings?: RubricSettings | null | undefined;
  /**
   * Rubric criteria.
   * Present only when a rubric has been attached.
   */
  rubric?: RubricCriterion[] | null | undefined;
  /**
   * Student IDs that can see this assignment.
   * Present only when `include[]=assignment_visibility`.
   */
  assignment_visibility?: number[] | null | undefined;
  /**
   * Due-date overrides.
   * Present only when `include[]=overrides`.
   */
  overrides?: AssignmentOverride[] | null | undefined;
  /** Whether this assignment is omitted from the final grade. */
  omit_from_final_grade?: boolean | undefined;
  /** Whether to restrict quantitative data display. */
  restrict_quantitative_data?: boolean | undefined;
  /** Secure params JWT for LTI tools. */
  secure_params?: string | undefined;
  /** Frozen attributes list (blueprint courses). */
  frozen_attributes?: string[] | undefined;
}

// ---------------------------------------------------------------------------
// Request parameter types
// ---------------------------------------------------------------------------

/**
 * Parameters accepted by `GET /courses/:course_id/assignments`.
 */
export interface ListAssignmentsParams {
  /**
   * Additional fields to include.
   *
   * Common values:
   * - `"submission"` — current user's submission
   * - `"assignment_visibility"` — student IDs that can see this
   * - `"all_dates"` — all date overrides
   * - `"overrides"` — override objects
   * - `"observed_users"` — submissions for observed users
   * - `"can_edit"` — whether the current user can edit
   * - `"score_statistics"` — score statistics
   * - `"ab_guid"` — AB GUID
   */
  include?: string[] | undefined;
  /** Filter by search term (matches name). */
  search_term?: string | undefined;
  /**
   * Return only assignments in this state bucket.
   *
   * - `"past"` — due date has passed
   * - `"overdue"` — past due with no submission
   * - `"undated"` — no due date
   * - `"ungraded"` — submitted but not yet graded
   * - `"unsubmitted"` — not yet submitted
   * - `"upcoming"` — due in the near future
   * - `"future"` — due in the future
   */
  bucket?:
    | "past"
    | "overdue"
    | "undated"
    | "ungraded"
    | "unsubmitted"
    | "upcoming"
    | "future"
    | undefined;
  /** Filter to a specific assignment group. */
  assignment_ids?: number[] | undefined;
  /** Sort field. */
  order_by?: "position" | "name" | "due_at" | undefined;
  /** Whether to post grades to SIS. */
  post_to_sis?: boolean | undefined;
  /** Only return new quizzes. */
  new_quizzes?: boolean | undefined;
  /** Number of results per page. */
  per_page?: number | undefined;
}

/**
 * Parameters accepted by `GET /courses/:course_id/assignments/:id`.
 */
export interface GetAssignmentParams {
  /** Additional fields to include. */
  include?: string[] | undefined;
  /** Return overrides. */
  override_assignment_dates?: boolean | undefined;
  /** Ignore assignment overrides on the returned object. */
  needs_grading_count_by_section?: boolean | undefined;
  /** All dates. */
  all_dates?: boolean | undefined;
  /**
   * Return only assignments in this state bucket.
   * Only valid when `assignment_id` is omitted.
   */
  bucket?:
    | "past"
    | "overdue"
    | "undated"
    | "ungraded"
    | "unsubmitted"
    | "upcoming"
    | "future"
    | undefined;
}

/**
 * Parameters accepted by `POST /courses/:course_id/assignments` (create).
 */
export interface CreateAssignmentParams {
  assignment: {
    /** Assignment name (required). */
    name: string;
    /** Display position within its group. */
    position?: number | undefined;
    /** Submission types. */
    submission_types?: SubmissionType[] | undefined;
    /** Allowed file extensions for upload submissions. */
    allowed_extensions?: string[] | undefined;
    /** Whether Turnitin is enabled. */
    turnitin_enabled?: boolean | undefined;
    /** Whether VeriCite is enabled. */
    vericite_enabled?: boolean | undefined;
    /** Turnitin settings. */
    turnitin_settings?: Partial<TurnitinSettings> | undefined;
    /** SIS integration ID. */
    integration_id?: string | undefined;
    /** Integration data. */
    integration_data?: Record<string, unknown> | undefined;
    /** Whether peer reviews are required. */
    peer_reviews?: boolean | undefined;
    /** Automatically assign peer reviews. */
    automatic_peer_reviews?: boolean | undefined;
    /** Number of peer reviews. */
    peer_review_count?: number | undefined;
    /** When peer reviews are assigned. */
    peer_reviews_assign_at?: ISO8601 | undefined;
    /** Group category ID (for group assignments). */
    group_category_id?: number | undefined;
    /** Whether group members grade individually. */
    grade_group_students_individually?: boolean | undefined;
    /** LTI tool configuration. */
    external_tool_tag_attributes?: Partial<ExternalToolTagAttributes> | undefined;
    /** Points possible. */
    points_possible?: number | undefined;
    /** Grading type. */
    grading_type?: GradingType | undefined;
    /** ISO 8601 due date. */
    due_at?: ISO8601 | undefined;
    /** ISO 8601 lock date. */
    lock_at?: ISO8601 | undefined;
    /** ISO 8601 unlock date. */
    unlock_at?: ISO8601 | undefined;
    /** Only visible to overridden students. */
    only_visible_to_overrides?: boolean | undefined;
    /** Whether the assignment is published. */
    published?: boolean | undefined;
    /** Assignment group ID. */
    assignment_group_id?: number | undefined;
    /** Whether to hide in gradebook. */
    hide_in_gradebook?: boolean | undefined;
    /** Whether to omit from final grade. */
    omit_from_final_grade?: boolean | undefined;
    /** HTML description. */
    description?: string | undefined;
    /** Assignment overrides. */
    assignment_overrides?: Array<Partial<AssignmentOverride>> | undefined;
    /** Whether to notify enrolled users of the update. */
    notify_of_update?: boolean | undefined;
    /** Number of allowed attempts. */
    allowed_attempts?: number | undefined;
    /** Whether to post to SIS. */
    post_to_sis?: boolean | undefined;
    /** SIS assignment ID. */
    sis_assignment_id?: string | undefined;
    /** Whether anonymous grading is on. */
    anonymous_grading?: boolean | undefined;
    /** Whether anonymous submissions are on. */
    anonymous_submissions?: boolean | undefined;
    /** Moderated grading. */
    moderated_grading?: boolean | undefined;
    /** Number of graders. */
    grader_count?: number | undefined;
    /** Final grader user ID. */
    final_grader_id?: number | undefined;
    /** Grader comments visible to graders. */
    grader_comments_visible_to_graders?: boolean | undefined;
    /** Graders anonymous to each other. */
    graders_anonymous_to_graders?: boolean | undefined;
    /** Grader names visible to final grader. */
    grader_names_visible_to_final_grader?: boolean | undefined;
    /** Require LockDown Browser. */
    require_lockdown_browser?: boolean | undefined;
    /** Post manually. */
    post_manually?: boolean | undefined;
    /** Important dates. */
    important_dates?: boolean | undefined;
  };
}

/**
 * Parameters accepted by `PUT /courses/:course_id/assignments/:id` (update).
 * Same shape as create but all fields are optional.
 */
export type UpdateAssignmentParams = {
  assignment: Partial<CreateAssignmentParams["assignment"]>;
};
