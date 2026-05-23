/**
 * Types for the Canvas Users API.
 *
 * @see https://canvas.instructure.com/doc/api/users.html
 * @module types/users
 */

import type { ISO8601, UserId } from "./common";

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

/**
 * A Canvas user object as returned by most API responses.
 *
 * The set of fields present depends heavily on which `include[]` parameters
 * were passed to the endpoint and on the caller's permissions.
 */
export interface User {
  /** Unique numeric identifier for the user. */
  id: UserId;
  /** The full name of the user. */
  name: string;
  /** The name used for sorting (typically "Last, First"). */
  sortable_name: string;
  /** The short name displayed in conversations. */
  short_name: string;
  /** The SIS (Student Information System) user ID, if any. */
  sis_user_id: string | null;
  /** Canvas integration ID, if any. */
  integration_id?: string | null | undefined;
  /** SIS import ID, if any. */
  sis_import_id?: number | null | undefined;
  /** Primary login identifier (usually an email or username). */
  login_id?: string | undefined;
  /** URL to the user's avatar image. */
  avatar_url?: string | undefined;
  /** Whether this user is a test student. */
  test_student?: boolean | undefined;
  /** User's primary email address. Only visible to admins or the user itself. */
  email?: string | undefined;
  /** User locale (e.g. `"en"`). */
  locale?: string | undefined;
  /** Timestamp of the user's last login. */
  last_login?: ISO8601 | undefined;
  /** Enrollments for this user (present when `include[]=enrollments`). */
  enrollments?: unknown[] | undefined;
  /** Custom data attached to the user (admin-only). */
  custom_data?: unknown | undefined;
}

/**
 * Extended user profile, returned by the `/users/:id/profile` endpoint.
 */
export interface UserProfile {
  /** Unique numeric identifier. */
  id: UserId;
  /** Full name. */
  name: string;
  /** Sortable name. */
  sortable_name: string;
  /** Short name / nickname. */
  short_name: string;
  /** SIS user ID. */
  sis_user_id: string | null;
  /** Primary login identifier. */
  login_id: string;
  /** Avatar image URL. */
  avatar_url: string;
  /** Primary email address. */
  primary_email: string;
  /** Locale setting. */
  locale: string;
  /** Biography / about-me text. */
  bio: string | null;
  /** Title (e.g. "Professor"). */
  title?: string | undefined;
  /** User's time-zone preference (IANA zone name). */
  time_zone?: string | undefined;
  /** Link to the user's personal calendar feed. */
  calendar?: { ics: string } | undefined;
  /** Whether the user has accepted the terms of use. */
  terms_of_use?: boolean | undefined;
  /** Whether the user account is active. */
  effective_locale?: string | undefined;
}

/**
 * A minimal user representation used in activity streams and participant lists.
 */
export interface UserDisplay {
  /** Unique numeric identifier. */
  id: UserId;
  /** Short/display name. */
  display_name: string;
  /** Avatar image URL. */
  avatar_image_url: string;
  /** URL to the user's Canvas profile page. */
  html_url: string;
  /** Pronouns, if set by the user. */
  pronouns: string | null;
  /** Opaque random identifier (used in some anonymous contexts). */
  anonymous_id?: string | undefined;
}

/**
 * Activity stream item for a user.
 */
export interface ActivityStreamItem {
  /** Unique identifier of the activity item. */
  id: number;
  /** Type of activity (e.g. `"DiscussionTopic"`, `"Submission"`, etc.). */
  type: string;
  /** ID of the course this activity belongs to. */
  course_id?: number | undefined;
  /** Timestamp when the activity was created. */
  created_at: ISO8601;
  /** Timestamp of the most recent update. */
  updated_at: ISO8601;
  /** Title of the activity. */
  title: string;
  /** Short message / preview. */
  message: string | null;
  /** URL to view the activity in Canvas. */
  html_url: string;
  /** Whether the current user has read this item. */
  read_state: boolean;
  /** Number of unread replies/entries. */
  unread_count?: number | undefined;
  /** Participants in this activity thread. */
  participants?: UserDisplay[] | undefined;
}

/**
 * A todo item in the current user's Canvas to-do list.
 */
export interface TodoItem {
  /**
   * Type of to-do action.
   * - `"submitting"` — the user has an assignment to submit.
   * - `"grading"` — an instructor has submissions to grade.
   */
  type: "submitting" | "grading";
  /** The assignment associated with this to-do item. */
  assignment: {
    id: number;
    name: string;
    due_at: ISO8601 | null;
    html_url: string;
    course_id: number;
    points_possible: number;
    submission_types: string[];
  };
  /** URL to ignore this to-do item temporarily. */
  ignore: string;
  /** URL to ignore this to-do item permanently. */
  ignore_permanently: string;
  /** URL to view the to-do item in Canvas. */
  html_url: string;
  /** Whether the context is a Course or Group. */
  context_type: "Course" | "Group";
  /** ID of the associated course. */
  course_id: number | null;
  /** ID of the associated group. */
  group_id: number | null;
}

// ---------------------------------------------------------------------------
// Request parameter types
// ---------------------------------------------------------------------------

/**
 * Parameters accepted by `GET /users` (list users in an account).
 */
export interface ListUsersParams {
  /** Search by name, email, or login. */
  search_term?: string | undefined;
  /** Filter by enrollment type. */
  enrollment_type?: string | undefined;
  /** Sort field. */
  sort?: "username" | "email" | "sis_id" | "last_login" | undefined;
  /** Sort direction. */
  order?: "asc" | "desc" | undefined;
  /**
   * Additional fields to include.
   * @example ["email", "enrollments", "last_login"]
   */
  include?: string[] | undefined;
}

/**
 * Parameters accepted by `GET /users/:id`.
 */
export interface GetUserParams {
  /**
   * Additional fields to include.
   * @example ["uuid", "last_login"]
   */
  include?: string[] | undefined;
}
