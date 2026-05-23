/**
 * Types for the Canvas Pages (Wiki) API.
 *
 * @see https://canvas.instructure.com/doc/api/pages.html
 * @module types/pages
 */

import type { ISO8601, PageId } from "./common";

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

/**
 * Who is allowed to edit a page.
 *
 * - `"teachers"` — only teachers/TAs.
 * - `"students"` — students and teachers.
 * - `"members"` — group members (group pages only).
 * - `"public"` — anyone, including unauthenticated visitors.
 */
export type PageEditingRole = "teachers" | "students" | "members" | "public";

// ---------------------------------------------------------------------------
// Core type
// ---------------------------------------------------------------------------

/**
 * A Canvas wiki page.
 */
export interface Page {
  /**
   * URL slug used to identify the page (not a full URL).
   * Used as the `:url_or_id` parameter in page endpoints.
   *
   * @example "course-syllabus"
   */
  url: string;
  /**
   * Numeric page ID.
   * Present on most responses; may be absent in some list contexts.
   */
  page_id?: PageId | undefined;
  /** Page title. */
  title: string;
  /**
   * HTML body of the page.
   * May be absent in list responses unless `include[]=body` is requested.
   */
  body?: string | undefined;
  /**
   * Who can edit this page.
   * @see {@link PageEditingRole}
   */
  editing_roles: PageEditingRole | string;
  /** ISO 8601 creation timestamp. */
  created_at: ISO8601;
  /** ISO 8601 last-updated timestamp. */
  updated_at: ISO8601;
  /** ISO 8601 due date (for graded pages). */
  todo_date?: ISO8601 | null | undefined;
  /** Whether the page is published. */
  published: boolean;
  /** Whether this is the course's front page. */
  front_page: boolean;
  /** Whether the page is locked for the current user. */
  locked_for_user: boolean;
  /** Human-readable explanation of why the page is locked. */
  lock_explanation?: string | undefined;
  /** Lock details. */
  lock_info?: unknown | undefined;
  /** URL to the page in Canvas. */
  html_url: string;
  /** Last editor's user ID. */
  last_edited_by?: {
    id: number;
    display_name: string;
    avatar_image_url: string;
    html_url: string;
  } | undefined;
}

// ---------------------------------------------------------------------------
// Request parameter types
// ---------------------------------------------------------------------------

/**
 * Parameters accepted by `GET /courses/:course_id/pages`.
 */
export interface ListPagesParams {
  /** Sort field. */
  sort?: "title" | "created_at" | "updated_at" | undefined;
  /** Sort direction. */
  order?: "asc" | "desc" | undefined;
  /** Filter by search term. */
  search_term?: string | undefined;
  /** Filter by published state. */
  published?: boolean | undefined;
  /** Number of results per page. */
  per_page?: number | undefined;
  /**
   * Additional fields to include.
   * Common values: `"body"`
   */
  include?: string[] | undefined;
}

/**
 * Parameters accepted by `GET /courses/:course_id/pages/:url_or_id`.
 */
export interface GetPageParams {
  /** Additional fields to include. */
  include?: string[] | undefined;
}

/**
 * Parameters accepted by `PUT /courses/:course_id/pages/:url_or_id` (update).
 */
export interface UpdatePageParams {
  wiki_page: {
    /** New page title. */
    title?: string | undefined;
    /** HTML body. */
    body?: string | undefined;
    /** Editing roles. */
    editing_roles?: PageEditingRole | undefined;
    /** Whether the page is a student to-do item. */
    student_todo_at?: ISO8601 | undefined;
    /** Whether to notify users of the update. */
    notify_of_update?: boolean | undefined;
    /** Whether to publish the page. */
    published?: boolean | undefined;
    /** Whether this should become the course front page. */
    front_page?: boolean | undefined;
  };
}

/**
 * Parameters accepted by `POST /courses/:course_id/pages` (create).
 */
export interface CreatePageParams {
  wiki_page: {
    /** Page title (required). */
    title: string;
    /** HTML body. */
    body?: string | undefined;
    /** Editing roles. */
    editing_roles?: PageEditingRole | undefined;
    /** Whether to notify users. */
    notify_of_update?: boolean | undefined;
    /** Whether to publish the page. */
    published?: boolean | undefined;
    /** Whether this is the front page. */
    front_page?: boolean | undefined;
    /** Due date for student to-do. */
    student_todo_at?: ISO8601 | undefined;
  };
}
