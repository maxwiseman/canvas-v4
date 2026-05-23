/**
 * Types for the Canvas Submissions API.
 *
 * @see https://canvas.instructure.com/doc/api/submissions.html
 * @module types/submissions
 */

import type {
  AssignmentId,
  CourseId,
  ISO8601,
  RubricAssessment,
  SubmissionId,
  UserId,
} from "./common";
import type { SubmissionType } from "./assignments";

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

/**
 * Workflow state of a submission.
 *
 * - `"submitted"` — the student has submitted.
 * - `"unsubmitted"` — no submission yet.
 * - `"graded"` — an instructor has graded the submission.
 * - `"pending_review"` — submitted but awaiting moderation review.
 */
export type SubmissionWorkflowState =
  | "submitted"
  | "unsubmitted"
  | "graded"
  | "pending_review";

// ---------------------------------------------------------------------------
// Sub-objects
// ---------------------------------------------------------------------------

/**
 * A comment thread entry on a submission.
 */
export interface SubmissionComment {
  /** Unique identifier. */
  id: number;
  /** The comment text. */
  comment: string;
  /** ISO 8601 creation timestamp. */
  created_at: ISO8601;
  /** ID of the author. */
  author_id: number;
  /** Display name of the author. */
  author_name: string;
  /** File attachments on this comment. */
  attachments?: SubmissionAttachment[] | undefined;
  /** Media comment (audio/video). */
  media_comment?: {
    content_type: string;
    display_name: string;
    media_id: string;
    media_type: "audio" | "video";
    url: string;
  } | undefined;
}

/**
 * A file attachment on a submission or comment.
 */
export interface SubmissionAttachment {
  /** Unique identifier. */
  id: number;
  /** UUID. */
  uuid: string;
  /** Folder ID. */
  folder_id: number;
  /** Display name. */
  display_name: string;
  /** Raw filename. */
  filename: string;
  /** MIME type. */
  content_type: string;
  /** Download URL. */
  url: string;
  /** File size in bytes. */
  size: number;
  /** ISO 8601 creation timestamp. */
  created_at: ISO8601;
  /** ISO 8601 last-modified timestamp. */
  updated_at: ISO8601;
}

/**
 * Media object embedded in a submission (audio/video recording).
 */
export interface MediaComment {
  /** MIME content type. */
  content_type: string;
  /** Human-readable display name. */
  display_name: string;
  /** Kaltura media entry ID. */
  media_id: string;
  /** Media type. */
  media_type: "audio" | "video";
  /** Playback URL. */
  url: string;
}

// ---------------------------------------------------------------------------
// Core type
// ---------------------------------------------------------------------------

/**
 * A Canvas submission — a student's response to an assignment.
 */
export interface Submission {
  /** Unique numeric identifier. */
  id: SubmissionId;
  /** ID of the assignment this submission belongs to. */
  assignment_id: AssignmentId;
  /**
   * The assignment object.
   * Present only when `include[]=assignment`.
   */
  assignment?: unknown | undefined;
  /**
   * The course object.
   * Present only when `include[]=course`.
   */
  course?: unknown | undefined;
  /** Attempt number (1-indexed). */
  attempt: number;
  /** The submission body for online_text_entry submissions. */
  body: string | null;
  /** Formatted grade (e.g. `"A"`, `"95"`, `"complete"`). */
  grade: string | null;
  /** Whether the grade matches the current submission attempt. */
  grade_matches_current_submission: boolean;
  /** URL to the submission (for online_url submissions). */
  html_url: string;
  /** Preview URL in Canvas. */
  preview_url: string;
  /** Numeric score. */
  score: number | null;
  /**
   * Comments left by students and instructors.
   * Present only when `include[]=submission_comments`.
   */
  submission_comments?: SubmissionComment[] | undefined;
  /** The submission type. */
  submission_type: SubmissionType | null;
  /** ISO 8601 timestamp when the submission was made. */
  submitted_at: ISO8601 | null;
  /** Submitted URL (for online_url submissions). */
  url: string | null;
  /** ID of the student who submitted. */
  user_id: UserId;
  /** ID of the grader (may be `null` if auto-graded). */
  grader_id: number | null;
  /** ISO 8601 timestamp when the submission was graded. */
  graded_at: ISO8601 | null;
  /**
   * The user object of the submitter.
   * Present only when `include[]=user`.
   */
  user?: unknown | undefined;
  /** Whether the submission was late. */
  late: boolean;
  /** Whether the assignment is missing (past due, no submission). */
  missing: boolean;
  /** Whether the submission was excused from grading. */
  excused: boolean | null;
  /**
   * How many points were deducted for lateness.
   * Present when a late policy is configured.
   */
  points_deducted?: number | null | undefined;
  /**
   * The score before any late-penalty deductions.
   */
  entered_score?: number | null | undefined;
  /** The grade before late penalties. */
  entered_grade?: string | null | undefined;
  /** Workflow state of the submission. */
  workflow_state: SubmissionWorkflowState;
  /** File attachments for upload submissions. */
  attachments?: SubmissionAttachment[] | undefined;
  /** Media comment for media_recording submissions. */
  media_comment?: MediaComment | undefined;
  /**
   * Rubric criterion assessments.
   * Present only when `include[]=rubric_assessment`.
   */
  rubric_assessment?: RubricAssessment | undefined;
  /** Whether the submission has been read by an instructor. */
  read_status?: "read" | "unread" | undefined;
  /** ID of the course this submission belongs to. */
  course_id?: CourseId | undefined;
  /**
   * The anonymous ID of the student (when anonymous grading is on).
   */
  anonymous_id?: string | undefined;
  /**
   * Peer review assessment.
   * Present only for peer-reviewed submissions.
   */
  assessments?: unknown[] | undefined;
  /** Annotatable attachment ID (for student annotation submissions). */
  annotatable_attachment_id?: number | null | undefined;
}

// ---------------------------------------------------------------------------
// Request parameter types
// ---------------------------------------------------------------------------

/**
 * Parameters accepted by `GET /courses/:course_id/assignments/:assignment_id/submissions`.
 */
export interface ListSubmissionsParams {
  /**
   * Additional fields to include.
   *
   * Common values:
   * - `"submission_comments"` — comments
   * - `"submission_history"` — previous attempts
   * - `"rubric_assessment"` — rubric results
   * - `"assignment"` — assignment object
   * - `"visibility"` — submission visibility
   * - `"course"` — course object
   * - `"user"` — user object
   * - `"group"` — group membership
   * - `"read_status"` — read/unread state
   */
  include?: string[] | undefined;
  /** Filter by grading status. */
  grading_status?: "needs_grading" | "excused" | "needs_review" | "graded" | undefined;
  /** Number of results per page. */
  per_page?: number | undefined;
}

/**
 * Parameters accepted by `GET /courses/:course_id/students/submissions`.
 * (Get all submissions for multiple assignments.)
 */
export interface ListStudentSubmissionsParams {
  /** Limit to a set of student IDs. */
  student_ids?: (number | "all")[] | undefined;
  /** Limit to specific assignment IDs. */
  assignment_ids?: number[] | undefined;
  /** Additional fields to include. */
  include?: string[] | undefined;
  /** Filter by grading status. */
  grading_status?: "needs_grading" | "excused" | "needs_review" | "graded" | undefined;
  /** Order by. */
  order?: "id" | "graded_at" | undefined;
  /** Order direction. */
  order_direction?: "ascending" | "descending" | undefined;
  /** Number of results per page. */
  per_page?: number | undefined;
}

/**
 * Parameters accepted by `POST /courses/:course_id/assignments/:assignment_id/submissions`.
 */
export interface CreateSubmissionParams {
  submission: {
    /**
     * The type of submission being made.
     * @see {@link SubmissionType}
     */
    submission_type: SubmissionType;
    /** Body text for `online_text_entry` submissions. */
    body?: string | undefined;
    /** URL for `online_url` submissions. */
    url?: string | undefined;
    /** File IDs for `online_upload` submissions. */
    file_ids?: number[] | undefined;
    /** Media comment ID for `media_recording` submissions. */
    media_comment_id?: string | undefined;
    /** Media comment type for `media_recording` submissions. */
    media_comment_type?: "audio" | "video" | undefined;
    /** User ID to submit on behalf of (teachers only). */
    user_id?: UserId | undefined;
    /** Annotatable attachment ID for `student_annotation` submissions. */
    annotatable_attachment_id?: number | undefined;
    /** Whether to submit the assignment. */
    submitted?: boolean | undefined;
  };
  /** Optional comment to include with the submission. */
  comment?: {
    text_comment?: string | undefined;
  } | undefined;
}

/**
 * Parameters accepted by `PUT /courses/:course_id/assignments/:assignment_id/submissions/:user_id`.
 * (Grade or comment on a submission.)
 */
export interface GradeSubmissionParams {
  submission?: {
    /** The grade to assign (points, letter, or `"complete"`/`"incomplete"`). */
    posted_grade?: string | undefined;
    /** Whether the submission is excused. */
    excuse?: boolean | undefined;
    /** Whether to release or hide the grade. */
    late_policy_status?: "late" | "missing" | "extended" | "none" | undefined;
    /** Number of seconds the submission is late. */
    seconds_late_override?: number | undefined;
  } | undefined;
  /** Comment to add to the submission. */
  comment?: {
    text_comment?: string | undefined;
    group_comment?: boolean | undefined;
    media_comment_id?: string | undefined;
    media_comment_type?: "audio" | "video" | undefined;
    file_ids?: number[] | undefined;
  } | undefined;
  /** Rubric assessment data. */
  rubric_assessment?: RubricAssessment | undefined;
}
