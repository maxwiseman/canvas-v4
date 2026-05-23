/**
 * Types for the Canvas Quizzes API.
 *
 * @see https://canvas.instructure.com/doc/api/quizzes.html
 * @module types/quizzes
 */

import type { ISO8601, QuizId, QuizSubmissionId, UserId } from "./common";

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

/**
 * The type of a Canvas quiz.
 *
 * - `"practice_quiz"` — ungraded practice quiz.
 * - `"assignment"` — graded quiz (counts toward a grade).
 * - `"graded_survey"` — a survey that is graded.
 * - `"survey"` — an ungraded survey.
 */
export type QuizType = "practice_quiz" | "assignment" | "graded_survey" | "survey";

/**
 * How to score multiple attempts.
 *
 * - `"keep_highest"` — use the highest score.
 * - `"keep_latest"` — use the most recent score.
 * - `"keep_average"` — use the average score.
 */
export type QuizScoringPolicy = "keep_highest" | "keep_latest" | "keep_average";

/**
 * How to hide correct answers.
 *
 * - `"always"` — never show correct answers.
 * - `"until_after_last_attempt"` — show after the last attempt.
 * - `"after_due_date"` — show after the due date.
 */
export type QuizHideCorrectAnswersAt = "always" | "until_after_last_attempt" | "after_due_date";

/**
 * Workflow state of a quiz submission.
 */
export type QuizSubmissionWorkflowState =
  | "untaken"
  | "pending_review"
  | "complete"
  | "settings_only"
  | "preview";

// ---------------------------------------------------------------------------
// Sub-objects
// ---------------------------------------------------------------------------

/**
 * Configuration for a quiz question.
 */
export interface QuizQuestion {
  /** Unique identifier. */
  id: number;
  /** ID of the quiz this question belongs to. */
  quiz_id: QuizId;
  /** Display position. */
  position: number;
  /** HTML question text. */
  question_name: string;
  /**
   * Question type.
   * Common values: `"multiple_choice_question"`, `"true_false_question"`,
   * `"short_answer_question"`, `"fill_in_multiple_blanks_question"`,
   * `"multiple_answers_question"`, `"multiple_dropdowns_question"`,
   * `"matching_question"`, `"numerical_question"`, `"calculated_question"`,
   * `"essay_question"`, `"file_upload_question"`, `"text_only_question"`
   */
  question_type: string;
  /** Points awarded for a correct answer. */
  points_possible: number;
  /** HTML question body. */
  question_text: string;
  /** Answer choices. */
  answers?: QuizAnswer[] | undefined;
  /** Correct comments shown after submission. */
  correct_comments?: string | undefined;
  /** Incorrect comments shown after submission. */
  incorrect_comments?: string | undefined;
  /** Neutral comments shown after submission. */
  neutral_comments?: string | undefined;
  /** HTML version of correct comments. */
  correct_comments_html?: string | undefined;
  /** HTML version of incorrect comments. */
  incorrect_comments_html?: string | undefined;
  /** HTML version of neutral comments. */
  neutral_comments_html?: string | undefined;
  /** Matching pairs (for matching questions). */
  matches?: Array<{ text: string; match_id: number }> | undefined;
}

/**
 * An answer option for a quiz question.
 */
export interface QuizAnswer {
  /** Unique identifier. */
  id: number;
  /** Answer text. */
  answer_text: string;
  /** Weight of this answer (100 = correct for multiple choice). */
  answer_weight: number;
  /** Comments shown when this answer is selected. */
  answer_comments?: string | undefined;
  /** Text label for fill-in-multiple-blanks. */
  blank_id?: string | undefined;
  /** Match ID for matching questions. */
  match_id?: number | undefined;
  /** HTML version of answer text. */
  answer_html?: string | undefined;
}

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

/**
 * A Canvas quiz object.
 */
export interface Quiz {
  /** Unique numeric identifier. */
  id: QuizId;
  /** Quiz title. */
  title: string;
  /** URL to the quiz in Canvas. */
  html_url: string;
  /** Mobile URL. */
  mobile_url?: string | undefined;
  /** Preview URL. */
  preview_url?: string | undefined;
  /** HTML description. */
  description: string | null;
  /**
   * Quiz type.
   * @see {@link QuizType}
   */
  quiz_type: QuizType;
  /** ID of the assignment this quiz is linked to. */
  assignment_id?: number | null | undefined;
  /** ID of the assignment group. */
  assignment_group_id?: number | undefined;
  /** Time limit in minutes, or `null` for unlimited. */
  time_limit: number | null;
  /** Whether questions are shuffled for each student. */
  shuffle_answers: boolean;
  /**
   * When to show correct answers.
   * `null` means always (or immediately after submission).
   */
  hide_results?: string | null | undefined;
  /** Whether to show correct answers after submission. */
  show_correct_answers: boolean;
  /** ISO 8601 date to start showing correct answers. */
  show_correct_answers_at: ISO8601 | null;
  /** ISO 8601 date to stop showing correct answers. */
  hide_correct_answers_at: ISO8601 | null;
  /** Whether to show correct answers only on the last attempt. */
  show_correct_answers_last_attempt?: boolean | undefined;
  /** Number of allowed attempts (-1 = unlimited). */
  allowed_attempts: number;
  /** Whether one-at-a-time question display is enabled. */
  one_question_at_a_time?: boolean | undefined;
  /** Total number of questions. */
  question_count: number;
  /** Maximum points possible. */
  points_possible: number;
  /** Whether students cannot return to previous questions. */
  cant_go_back?: boolean | undefined;
  /** Access code required to start the quiz. */
  access_code?: string | null | undefined;
  /** Whether the quiz requires an access code. */
  has_access_code: boolean;
  /** IP filter (CIDR) restricting who can take the quiz. */
  ip_filter?: string | null | undefined;
  /** ISO 8601 due date. */
  due_at: ISO8601 | null;
  /** ISO 8601 lock date. */
  lock_at: ISO8601 | null;
  /** ISO 8601 unlock date. */
  unlock_at: ISO8601 | null;
  /** Whether the quiz is published. */
  published: boolean;
  /** Whether the quiz can be unpublished. */
  unpublishable?: boolean | undefined;
  /** Whether the quiz is locked for the current user. */
  locked_for_user: boolean;
  /** Human-readable lock explanation. */
  lock_explanation?: string | undefined;
  /** Lock info details. */
  lock_info?: unknown | undefined;
  /**
   * Scoring policy for multiple attempts.
   * @see {@link QuizScoringPolicy}
   */
  scoring_policy: QuizScoringPolicy;
  /** Whether to only count visible questions in the final score. */
  only_visible_to_overrides?: boolean | undefined;
  /** Whether this is a survey. */
  anonymous_submissions?: boolean | undefined;
  /** Whether to require LockDown Browser. */
  require_lockdown_browser?: boolean | undefined;
  /** Whether to require LockDown Browser for results. */
  require_lockdown_browser_for_results?: boolean | undefined;
  /** Whether to require a webcam monitor. */
  require_lockdown_browser_monitor?: boolean | undefined;
  /** Whether to display one question at a time. */
  one_time_results?: boolean | undefined;
  /** Permissions for the current user. */
  permissions?: {
    read: boolean;
    submit: boolean;
    create: boolean;
    manage: boolean;
    read_statistics: boolean;
    review_grades: boolean;
    update: boolean;
    delete: boolean;
  } | undefined;
  /**
   * Questions in the quiz.
   * Present only when `include[]=questions` is requested.
   */
  questions?: QuizQuestion[] | undefined;
  /** All dates (base + overrides). */
  all_dates?: unknown[] | undefined;
}

/**
 * A student's quiz submission.
 */
export interface QuizSubmission {
  /** Unique identifier. */
  id: QuizSubmissionId;
  /** ID of the quiz. */
  quiz_id: QuizId;
  /** ID of the associated quiz version. */
  quiz_version: number;
  /** ID of the student. */
  user_id: UserId;
  /** ID of the associated assignment submission. */
  submission_id: number;
  /** Numeric score. */
  score: number | null;
  /** Score before any points were kept. */
  kept_score: number | null;
  /** ISO 8601 start timestamp. */
  started_at: ISO8601 | null;
  /** ISO 8601 end timestamp. */
  end_at: ISO8601 | null;
  /** ISO 8601 finalization timestamp. */
  finished_at: ISO8601 | null;
  /** Remaining time in seconds. */
  time_spent?: number | null | undefined;
  /** Attempt number. */
  attempt: number;
  /** Number of attempts still allowed. */
  attempts_left: number;
  /** Workflow state. */
  workflow_state: QuizSubmissionWorkflowState;
  /** Whether the score is overridden. */
  overdue_and_needs_submission?: boolean | undefined;
  /** Hash of quiz-data answers. */
  quiz_data?: unknown | undefined;
  /** Hash of question submissions. */
  submission_data?: unknown | undefined;
  /** Validation token (needed for submitting events). */
  validation_token?: string | undefined;
}

// ---------------------------------------------------------------------------
// Request parameter types
// ---------------------------------------------------------------------------

/**
 * Parameters accepted by `GET /courses/:course_id/quizzes`.
 */
export interface ListQuizzesParams {
  /** Filter by search term (matches title). */
  search_term?: string | undefined;
  /** Number of results per page. */
  per_page?: number | undefined;
}

/**
 * Parameters accepted by `POST /courses/:course_id/quizzes` (create).
 */
export interface CreateQuizParams {
  quiz: {
    /** Quiz title (required). */
    title: string;
    /** HTML description. */
    description?: string | undefined;
    /** Quiz type. */
    quiz_type?: QuizType | undefined;
    /** Assignment group ID. */
    assignment_group_id?: number | undefined;
    /** Time limit in minutes. */
    time_limit?: number | undefined;
    /** Whether to shuffle answers. */
    shuffle_answers?: boolean | undefined;
    /** When to hide results. */
    hide_results?: string | undefined;
    /** Whether to show correct answers. */
    show_correct_answers?: boolean | undefined;
    /** ISO 8601 show correct answers date. */
    show_correct_answers_at?: ISO8601 | undefined;
    /** ISO 8601 hide correct answers date. */
    hide_correct_answers_at?: ISO8601 | undefined;
    /** Number of allowed attempts (-1 = unlimited). */
    allowed_attempts?: number | undefined;
    /** Scoring policy. */
    scoring_policy?: QuizScoringPolicy | undefined;
    /** One question at a time. */
    one_question_at_a_time?: boolean | undefined;
    /** Can't go back. */
    cant_go_back?: boolean | undefined;
    /** Access code. */
    access_code?: string | undefined;
    /** IP filter. */
    ip_filter?: string | undefined;
    /** ISO 8601 due date. */
    due_at?: ISO8601 | undefined;
    /** ISO 8601 lock date. */
    lock_at?: ISO8601 | undefined;
    /** ISO 8601 unlock date. */
    unlock_at?: ISO8601 | undefined;
    /** Whether to publish. */
    published?: boolean | undefined;
  };
}

/**
 * Parameters accepted by `PUT /courses/:course_id/quizzes/:id` (update).
 */
export type UpdateQuizParams = { quiz: Partial<CreateQuizParams["quiz"]> };
