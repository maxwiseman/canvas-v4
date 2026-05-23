/**
 * Shared primitive types used across the Canvas SDK.
 *
 * @module types/common
 */

// ---------------------------------------------------------------------------
// Branded ID types
//
// Canvas uses numeric IDs everywhere. Branding them ensures you can't
// accidentally pass a CourseId where an AssignmentId is expected.
// ---------------------------------------------------------------------------

/** Unique identifier for a {@link Course}. */
export type CourseId = number & { readonly _brand: "CourseId" };

/** Unique identifier for an {@link Assignment}. */
export type AssignmentId = number & { readonly _brand: "AssignmentId" };

/** Unique identifier for a {@link User}. */
export type UserId = number & { readonly _brand: "UserId" };

/** Unique identifier for an {@link Enrollment}. */
export type EnrollmentId = number & { readonly _brand: "EnrollmentId" };

/** Unique identifier for a {@link Submission}. */
export type SubmissionId = number & { readonly _brand: "SubmissionId" };

/** Unique identifier for a {@link Module}. */
export type ModuleId = number & { readonly _brand: "ModuleId" };

/** Unique identifier for a {@link ModuleItem}. */
export type ModuleItemId = number & { readonly _brand: "ModuleItemId" };

/** Unique identifier for a {@link Page}. */
export type PageId = number & { readonly _brand: "PageId" };

/** Unique identifier for a {@link File}. */
export type FileId = number & { readonly _brand: "FileId" };

/** Unique identifier for a {@link Folder}. */
export type FolderId = number & { readonly _brand: "FolderId" };

/** Unique identifier for a {@link DiscussionTopic}. */
export type DiscussionTopicId = number & { readonly _brand: "DiscussionTopicId" };

/** Unique identifier for a {@link DiscussionEntry}. */
export type DiscussionEntryId = number & { readonly _brand: "DiscussionEntryId" };

/** Unique identifier for a {@link Quiz}. */
export type QuizId = number & { readonly _brand: "QuizId" };

/** Unique identifier for a {@link QuizSubmission}. */
export type QuizSubmissionId = number & { readonly _brand: "QuizSubmissionId" };

/** Unique identifier for a {@link CalendarEvent}. */
export type CalendarEventId = number & { readonly _brand: "CalendarEventId" };

/** Unique identifier for a {@link Conversation}. */
export type ConversationId = number & { readonly _brand: "ConversationId" };

/** Unique identifier for a {@link Section}. */
export type SectionId = number & { readonly _brand: "SectionId" };

/** Unique identifier for a {@link GroupId}. */
export type GroupId = number & { readonly _brand: "GroupId" };

/** Unique identifier for a {@link RubricId}. */
export type RubricId = number & { readonly _brand: "RubricId" };

// ---------------------------------------------------------------------------
// Scalar aliases for documentation clarity
// ---------------------------------------------------------------------------

/**
 * An ISO 8601 UTC timestamp string, as returned by the Canvas API.
 *
 * @example "2024-09-01T00:00:00Z"
 */
export type ISO8601 = string;

// ---------------------------------------------------------------------------
// Shared sub-objects
// ---------------------------------------------------------------------------

/**
 * Lock information for a content object (assignment, page, quiz, etc.).
 * Present when the object is locked for the current user.
 */
export interface LockInfo {
  /** A string describing the locked asset (e.g. `"assignment_321"`). */
  asset_string: string;
  /** The date/time after which the content becomes available. */
  unlock_at?: ISO8601 | undefined;
  /** The date/time at which the content locks. */
  lock_at?: ISO8601 | undefined;
  /** The context module that caused the lock, if any. */
  context_module?: {
    id: number;
    name: string;
    unlock_at: ISO8601 | null;
  } | undefined;
  /** Whether the object was manually locked by an instructor. */
  manually_locked?: boolean | undefined;
}

/**
 * Rubric criterion ratings — a single scoring level for one criterion.
 */
export interface RubricRating {
  /** Unique identifier for this rating (within the criterion). */
  id: string;
  /** Short label shown on the rubric grid. */
  description: string;
  /** Extended description / feedback guidance. */
  long_description: string;
  /** Points awarded for selecting this rating. */
  points: number;
}

/**
 * A single criterion row in a {@link Rubric}.
 */
export interface RubricCriterion {
  /** Unique identifier for this criterion (within the rubric). */
  id: string;
  /** Short label for the criterion. */
  description: string;
  /** Extended description of what is being evaluated. */
  long_description: string;
  /** Maximum points possible for this criterion. */
  points: number;
  /** When `true` a range of points can be awarded rather than discrete ratings. */
  criterion_use_range: boolean;
  /** All possible ratings for this criterion, from highest to lowest points. */
  ratings: RubricRating[];
  /** Whether this criterion is used for learning mastery outcomes. */
  learning_outcome_id?: number | undefined;
  /** Whether the criterion is based on an outcome. */
  ignore_for_scoring?: boolean | undefined;
}

/**
 * Top-level rubric settings attached to an {@link Assignment}.
 */
export interface RubricSettings {
  /** Sum of all criteria maximum points. */
  points_possible: number;
  /** Title of the rubric. */
  title: string;
  /** Canvas ID of the rubric object. */
  id: RubricId;
  /** Whether graders can leave free-form comments on criteria. */
  free_form_criterion_comments: boolean;
  /** Whether the points total is hidden from students. */
  hide_score_total?: boolean | undefined;
  /** Whether individual criterion points are hidden. */
  hide_points?: boolean | undefined;
}

/**
 * Rubric criterion assessment data stored on a {@link Submission}.
 * Keyed by criterion ID.
 */
export type RubricAssessment = Record<
  string,
  {
    /** Points awarded for this criterion. */
    points: number;
    /** The selected rating ID, if applicable. */
    rating_id?: string | undefined;
    /** Grader comment for this criterion. */
    comments?: string | undefined;
  }
>;

/**
 * A term (semester / quarter) in Canvas.
 */
export interface Term {
  /** Unique identifier for the term. */
  id: number;
  /** Human-readable name (e.g. "Fall 2024"). */
  name: string;
  /** ISO 8601 start date, or `null` if not set. */
  start_at: ISO8601 | null;
  /** ISO 8601 end date, or `null` if not set. */
  end_at: ISO8601 | null;
  /** SIS identifier for the term, if any. */
  sis_term_id?: string | undefined;
  /** Canvas grading period group associated with this term. */
  grading_period_group_id?: number | undefined;
}

/**
 * A grading period within a course or account.
 */
export interface GradingPeriod {
  /** Unique identifier. */
  id: number;
  /** Human-readable title (e.g. "Q1"). */
  title: string;
  /** ISO 8601 start date. */
  start_date: ISO8601;
  /** ISO 8601 end date. */
  end_date: ISO8601;
  /** ISO 8601 close date (submissions locked after this). */
  close_date: ISO8601;
  /** Weight applied to this period's grades, if weighting is enabled. */
  weight: number | null;
  /** Whether the grading period is closed for grade changes. */
  is_closed: boolean;
  /** Whether this is the last grading period. */
  is_last: boolean;
}

/**
 * External tool tag attributes attached to an assignment.
 */
export interface ExternalToolTagAttributes {
  /** URL of the external tool. */
  url: string;
  /** Whether a new tab is opened when launching the tool. */
  new_tab: boolean;
  /** Resource link ID used in LTI Advantage. */
  resource_link_id?: string | undefined;
}
