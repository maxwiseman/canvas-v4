/**
 * Types for the Canvas Announcements API.
 *
 * Announcements in Canvas are a specialised form of discussion topic.
 * All announcement-specific types here extend the base discussion types.
 *
 * @see https://canvas.instructure.com/doc/api/announcements.html
 * @module types/announcements
 */

import type { ISO8601 } from "./common";
import type { DiscussionTopic } from "./discussions";

// ---------------------------------------------------------------------------
// Re-export convenience alias
// ---------------------------------------------------------------------------

/**
 * An announcement is structurally identical to a {@link DiscussionTopic} with
 * `is_announcement: true`.
 */
export type Announcement = DiscussionTopic & { is_announcement: true };

// ---------------------------------------------------------------------------
// Request parameter types
// ---------------------------------------------------------------------------

/**
 * Parameters accepted by `GET /announcements`.
 * (The announcements endpoint is global and scoped by `context_codes[]`.)
 */
export interface ListAnnouncementsParams {
  /**
   * Context codes to scope the request.
   * Format: `"course_<id>"`, `"group_<id>"`, `"user_<id>"`.
   *
   * @example ["course_123", "course_456"]
   */
  context_codes: string[];
  /** ISO 8601 start date filter (inclusive). */
  start_date?: ISO8601 | undefined;
  /** ISO 8601 end date filter (inclusive). */
  end_date?: ISO8601 | undefined;
  /** Only return active announcements. */
  active_only?: boolean | undefined;
  /** Whether to include student-created announcements (if allowed). */
  latest_only?: boolean | undefined;
  /**
   * Additional fields to include.
   * Common values: `"sections"`, `"sections_user_count"`
   */
  include?: string[] | undefined;
  /** Number of results per page. */
  per_page?: number | undefined;
}

/**
 * Parameters accepted by `POST /courses/:course_id/discussion_topics`
 * when creating an announcement.
 */
export interface CreateAnnouncementParams {
  /** Announcement title (required). */
  title: string;
  /** HTML message body. */
  message?: string | undefined;
  /** ISO 8601 delayed post date (schedule the announcement). */
  delayed_post_at?: ISO8601 | undefined;
  /** Whether to publish immediately. */
  published?: boolean | undefined;
  /** Whether to require an initial post before students can read replies. */
  require_initial_post?: boolean | undefined;
  /** Whether to allow rating of entries. */
  allow_rating?: boolean | undefined;
  /** Whether only graders can rate. */
  only_graders_can_rate?: boolean | undefined;
  /** Whether to sort by rating. */
  sort_by_rating?: boolean | undefined;
  /** Whether the announcement targets specific sections. */
  specific_sections?: string | undefined;
  /** Student to-do date. */
  todo_date?: ISO8601 | undefined;
  /** Whether to enable podcast feed. */
  podcast_enabled?: boolean | undefined;
}
