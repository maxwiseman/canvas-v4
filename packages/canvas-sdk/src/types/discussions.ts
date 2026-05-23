/**
 * Types for the Canvas Discussion Topics API.
 *
 * @see https://canvas.instructure.com/doc/api/discussion_topics.html
 * @module types/discussions
 */

import type { DiscussionEntryId, DiscussionTopicId, ISO8601, UserId } from "./common";
import type { Assignment } from "./assignments";

// ---------------------------------------------------------------------------
// Sub-objects
// ---------------------------------------------------------------------------

/**
 * A user as embedded in discussion view responses.
 */
export interface DiscussionParticipant {
  /** Unique identifier. */
  id: UserId;
  /** Display name. */
  display_name: string;
  /** Avatar image URL. */
  avatar_image_url: string;
  /** URL to the user's Canvas profile. */
  html_url: string;
  /** Pronouns, if set. */
  pronouns: string | null;
  /** Opaque anonymous ID. */
  anonymous_id?: string | undefined;
}

/**
 * Permissions the current user has on a discussion.
 */
export interface DiscussionPermissions {
  attach: boolean;
  update: boolean;
  reply: boolean;
  delete: boolean;
  create: boolean;
  moderate_forum?: boolean | undefined;
}

/**
 * A single entry (reply) in a discussion thread.
 */
export interface DiscussionEntry {
  /** Unique identifier. */
  id: DiscussionEntryId;
  /** ID of the user who posted this entry. */
  user_id: UserId;
  /** ID of the parent entry, or `null` for top-level entries. */
  parent_id: DiscussionEntryId | null;
  /** ISO 8601 creation timestamp. */
  created_at: ISO8601;
  /** ISO 8601 last-updated timestamp. */
  updated_at: ISO8601;
  /** Number of ratings received. */
  rating_count: number | null;
  /** Sum of ratings. */
  rating_sum: number | null;
  /** HTML message body. */
  message: string;
  /** Nested replies (only present in full view responses). */
  replies?: DiscussionEntry[] | undefined;
  /** ID of the last user to edit this entry. */
  editor_id?: number | undefined;
  /** Whether this entry is a "forced read" (always shown). */
  forced_read_state?: boolean | undefined;
  /** Whether the current user has read this entry. */
  read_state?: "read" | "unread" | undefined;
  /** Attachments on this entry. */
  attachments?: unknown[] | undefined;
}

/**
 * Full discussion view data, returned by the discussion view endpoint.
 */
export interface DiscussionView {
  /** IDs of entries the current user has not read. */
  unread_entries: number[];
  /** IDs of entries that are "forced read" for the current user. */
  forced_entries: number[];
  /** Map of entry ID → rating value given by the current user. */
  entry_ratings: Record<string, number>;
  /** All participants who have posted in this discussion. */
  participants: DiscussionParticipant[];
  /** Top-level entries (with nested replies). */
  view: DiscussionEntry[];
  /** IDs of new entries since the last view. */
  new_entries: number[];
}

// ---------------------------------------------------------------------------
// Core type
// ---------------------------------------------------------------------------

/**
 * A Canvas discussion topic.
 * Used for both discussions and announcements.
 */
export interface DiscussionTopic {
  /** Unique numeric identifier. */
  id: DiscussionTopicId;
  /** Discussion title. */
  title: string;
  /** ISO 8601 timestamp when the discussion was posted. */
  posted_at: ISO8601 | null;
  /** ID of the assignment this discussion is linked to, if graded. */
  assignment_id: number | null;
  /** ISO 8601 date when a delayed post will go live. */
  delayed_post_at: ISO8601 | null;
  /** ISO 8601 date when the discussion locks. */
  lock_at: ISO8601 | null;
  /** ISO 8601 creation timestamp. */
  created_at: ISO8601;
  /** ISO 8601 last-reply timestamp. */
  last_reply_at: ISO8601 | null;
  /** Whether this discussion requires an initial post before viewing others. */
  require_initial_post: boolean | null;
  /** Whether the current user can see other posts. */
  user_can_see_posts: boolean;
  /** Number of replies. */
  discussion_subentry_count: number;
  /** Current user's read state. */
  read_state: "read" | "unread";
  /** Number of unread replies. */
  unread_count: number;
  /** Whether the current user is subscribed. */
  subscribed: boolean;
  /** Subscription hold reason, if any. */
  subscription_hold?: string | undefined;
  /** ID of the root topic for group discussions. */
  root_topic_id: number | null;
  /** Podcast URL, if enabled. */
  podcast_url: string | null;
  /** Discussion type (e.g. `"side_comment"`, `"threaded"`). */
  discussion_type: string;
  /** Position in the topic list. */
  position: number | null;
  /** File attachments on the discussion. */
  attachments: unknown[];
  /** Whether the discussion is published. */
  published: boolean;
  /** Whether the discussion can be unpublished. */
  can_unpublish: boolean;
  /** Whether the discussion is locked for new replies. */
  locked: boolean;
  /** Whether the current user can lock the discussion. */
  can_lock: boolean;
  /** Whether comments are disabled. */
  comments_disabled: boolean;
  /** The author of the discussion. May be omitted for anonymous discussions or when not included in the response. */
  author?: DiscussionParticipant | undefined;
  /** URL to the discussion in Canvas. */
  html_url: string;
  /** URL to the discussion (same as html_url in most contexts). */
  url: string;
  /** Whether the discussion is pinned to the top of the list. */
  pinned: boolean;
  /** Whether the discussion is section-specific. */
  is_section_specific: boolean;
  /** Anonymous state. */
  anonymous_state: string | null;
  /** Whether AI summaries are enabled for this discussion. */
  summary_enabled: boolean;
  /** Name of the user who posted (may be null for anonymous). */
  user_name: string | null;
  /** Group category ID for group discussions. */
  group_category_id: number | null;
  /** Whether groups can be created for this discussion. */
  can_group: boolean;
  /** Child topic IDs (for section-specific discussions). */
  topic_children: number[];
  /** Group topic children. */
  group_topic_children: unknown[];
  /** Whether the discussion is locked for the current user. */
  locked_for_user: boolean;
  /** HTML message body. */
  message: string;
  /**
   * The associated assignment.
   * Present only when `include[]=assignment`.
   */
  assignment?: Assignment | undefined;
  /** Student to-do date. */
  todo_date: ISO8601 | null;
  /** Whether this topic is an announcement. */
  is_announcement: boolean;
  /** Current user's permissions. */
  permissions: DiscussionPermissions;
  /** Whether ratings are allowed. */
  allow_rating: boolean;
  /** Whether only graders can rate. */
  only_graders_can_rate: boolean;
  /** Whether to sort by rating. */
  sort_by_rating: boolean;
  /** Sort order. */
  sort_order?: string | undefined;
  /** Whether the sort order is locked. */
  sort_order_locked?: boolean | undefined;
  /** Whether to include podcast posts. */
  podcast_has_student_posts: boolean;
}

// ---------------------------------------------------------------------------
// Request parameter types
// ---------------------------------------------------------------------------

/**
 * Parameters accepted by `GET /courses/:course_id/discussion_topics`.
 */
export interface ListDiscussionTopicsParams {
  /**
   * Additional fields to include.
   * Common values: `"all_dates"`, `"sections"`, `"sections_user_count"`,
   * `"overrides"`, `"assignment"`, `"total_entries"`
   */
  include?: string[] | undefined;
  /** Sort field. */
  order_by?: "position" | "recent_activity" | "title" | undefined;
  /** Filter by scope. */
  scope?: "locked" | "unlocked" | "pinned" | "unpinned" | undefined;
  /** Only return pinned topics. */
  only_announcements?: boolean | undefined;
  /** Filter by search term. */
  search_term?: string | undefined;
  /** Filter by section IDs. */
  filter_by_unread?: boolean | undefined;
  /** Exclude announcements from results. */
  exclude_context_module_locked_topics?: boolean | undefined;
  /** Number of results per page. */
  per_page?: number | undefined;
}

/**
 * Parameters accepted by `POST /courses/:course_id/discussion_topics` (create).
 */
export interface CreateDiscussionTopicParams {
  /** Discussion title (required). */
  title: string;
  /** HTML message body. */
  message?: string | undefined;
  /** ISO 8601 delayed post date. */
  delayed_post_at?: ISO8601 | undefined;
  /** Whether to publish immediately. */
  published?: boolean | undefined;
  /** ISO 8601 lock date. */
  lock_at?: ISO8601 | undefined;
  /** Whether to require an initial post. */
  require_initial_post?: boolean | undefined;
  /** Whether to make an assignment (pass an assignment creation object). */
  assignment?: Partial<Assignment> | undefined;
  /** Whether it is a group discussion. */
  is_group_discussion?: boolean | undefined;
  /** Group category ID for group discussions. */
  group_category_id?: number | undefined;
  /** Whether the user is subscribed. */
  subscribed?: boolean | undefined;
  /** Whether to allow ratings. */
  allow_rating?: boolean | undefined;
  /** Whether only graders can rate. */
  only_graders_can_rate?: boolean | undefined;
  /** Whether to sort by rating. */
  sort_by_rating?: boolean | undefined;
  /** Discussion type. */
  discussion_type?: "side_comment" | "threaded" | undefined;
  /** Whether to pin to top. */
  pinned?: boolean | undefined;
  /** Section-specific data. */
  specific_sections?: string | undefined;
  /** Whether this is an announcement. */
  is_announcement?: boolean | undefined;
  /** Student to-do date. */
  todo_date?: ISO8601 | undefined;
  /** Whether to post a podcast feed. */
  podcast_enabled?: boolean | undefined;
  /** Whether to include student posts in podcast. */
  podcast_has_student_posts?: boolean | undefined;
}

/**
 * Parameters for posting a reply entry.
 * (`POST /courses/:course_id/discussion_topics/:topic_id/entries`)
 */
export interface CreateDiscussionEntryParams {
  /** HTML message text. */
  message?: string | undefined;
  /** File attachment IDs. */
  attachment_ids?: number[] | undefined;
}
