/**
 * Types for the Canvas Modules API.
 *
 * @see https://canvas.instructure.com/doc/api/modules.html
 * @module types/modules
 */

import type { ISO8601, LockInfo, ModuleId, ModuleItemId } from "./common";

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

/**
 * Workflow state of a module for the current user.
 *
 * - `"locked"` — prerequisites not yet met.
 * - `"unlocked"` — available but not started.
 * - `"started"` — at least one item has been viewed.
 * - `"completed"` — all completion requirements satisfied.
 */
export type ModuleState = "locked" | "unlocked" | "started" | "completed";

/**
 * The content type of a module item.
 */
export type ModuleItemType =
  | "File"
  | "Page"
  | "Discussion"
  | "Assignment"
  | "Quiz"
  | "SubHeader"
  | "ExternalUrl"
  | "ExternalTool";

/**
 * The type of completion requirement for a module item.
 *
 * - `"must_view"` — student must view the item.
 * - `"must_contribute"` — student must contribute (discussions, wikis).
 * - `"must_submit"` — student must submit the assignment.
 * - `"must_mark_done"` — student must manually mark as done.
 * - `"min_score"` — student must score at least `min_score`.
 */
export type CompletionRequirementType =
  | "must_view"
  | "must_contribute"
  | "must_submit"
  | "must_mark_done"
  | "min_score";

// ---------------------------------------------------------------------------
// Sub-objects
// ---------------------------------------------------------------------------

/**
 * The completion requirement for a module item.
 */
export interface CompletionRequirement {
  /**
   * The type of completion required.
   * @see {@link CompletionRequirementType}
   */
  type: CompletionRequirementType;
  /** Minimum score required when `type === "min_score"`. */
  min_score?: number | undefined;
  /** Whether the current user has completed this requirement. */
  completed: boolean;
}

/**
 * Content details embedded in a module item response.
 * Present only when `include[]=content_details` is requested.
 */
export interface ModuleItemContentDetails {
  /** Points possible (assignments/quizzes). */
  points_possible?: number | undefined;
  /** ISO 8601 due date. */
  due_at?: ISO8601 | undefined;
  /** ISO 8601 unlock date. */
  unlock_at?: ISO8601 | undefined;
  /** ISO 8601 lock date. */
  lock_at?: ISO8601 | undefined;
  /** Whether the item is locked for the current user. */
  locked_for_user?: boolean | undefined;
  /** Lock details. */
  lock_info?: LockInfo | undefined;
  /** Human-readable lock explanation. */
  lock_explanation?: string | undefined;
  /** Display name (for files). */
  display_name?: string | undefined;
  /** Thumbnail URL (for files/images). */
  thumbnail_url?: string | null | undefined;
  /** Whether the item is hidden from students. */
  hidden?: boolean | undefined;
}

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

/**
 * A Canvas module — a sequenced container of learning items within a course.
 */
export interface Module {
  /** Unique numeric identifier. */
  id: ModuleId;
  /** Workflow state for the current user. */
  workflow_state: ModuleState;
  /** Display position (1-indexed). */
  position: number;
  /** Human-readable module name. */
  name: string;
  /** ISO 8601 unlock date, or `null`. */
  unlock_at: ISO8601 | null;
  /** Whether items must be completed in order. */
  require_sequential_progress: boolean;
  /** IDs of modules that must be completed before this one unlocks. */
  prerequisite_module_ids: ModuleId[];
  /** Number of items in this module. */
  items_count: number;
  /** API URL to retrieve items. */
  items_url: string;
  /**
   * The module's items.
   * Present only when `include[]=items` is requested.
   */
  items?: ModuleItem[] | undefined;
  /** ISO 8601 completion timestamp, or `null`. */
  completed_at: ISO8601 | null;
  /** Whether the module is published. */
  published?: boolean | undefined;
  /** Whether the module can be unpublished. */
  unpublishable?: boolean | undefined;
}

/**
 * A single item within a {@link Module}.
 */
export interface ModuleItem {
  /** Unique numeric identifier. */
  id: ModuleItemId;
  /** ID of the module this item belongs to. */
  module_id: ModuleId;
  /** Display position within the module. */
  position: number;
  /** Human-readable title. */
  title: string;
  /** Indentation level (for sub-headers). */
  indent: number;
  /**
   * Content type.
   * @see {@link ModuleItemType}
   */
  type: ModuleItemType;
  /** ID of the underlying content object (assignment, page, etc.). */
  content_id?: number | undefined;
  /** URL to view the item in Canvas. */
  html_url: string;
  /** API URL for the underlying content object. */
  url?: string | undefined;
  /** URL slug for Page items. */
  page_url?: string | undefined;
  /** URL for ExternalUrl items. */
  external_url?: string | undefined;
  /** Whether the external tool opens in a new tab. */
  new_tab?: boolean | undefined;
  /** Completion requirement for this item. */
  completion_requirement?: CompletionRequirement | undefined;
  /**
   * Detailed content information.
   * Present only when `include[]=content_details`.
   */
  content_details?: ModuleItemContentDetails | undefined;
  /** Whether this item is published. */
  published?: boolean | undefined;
  /** Whether the item can be unpublished. */
  unpublishable?: boolean | undefined;
}

// ---------------------------------------------------------------------------
// Request parameter types
// ---------------------------------------------------------------------------

/**
 * Parameters accepted by `GET /courses/:course_id/modules`.
 */
export interface ListModulesParams {
  /**
   * Additional data to include.
   *
   * Common values:
   * - `"items"` — include module items
   * - `"content_details"` — include content details on items
   */
  include?: string[] | undefined;
  /** Search by module name. */
  search_term?: string | undefined;
  /** Filter to a specific student ID (instructor view). */
  student_id?: number | undefined;
  /** Number of results per page. */
  per_page?: number | undefined;
}

/**
 * Parameters accepted by `GET /courses/:course_id/modules/:module_id/items`.
 */
export interface ListModuleItemsParams {
  /**
   * Additional data to include.
   *
   * Common values:
   * - `"content_details"` — item content details
   */
  include?: string[] | undefined;
  /** Filter by search term. */
  search_term?: string | undefined;
  /** Filter to a specific student ID. */
  student_id?: number | undefined;
  /** Number of results per page. */
  per_page?: number | undefined;
}

/**
 * Parameters accepted by `POST /courses/:course_id/modules` (create).
 */
export interface CreateModuleParams {
  module: {
    /** Module name (required). */
    name: string;
    /** ISO 8601 unlock date. */
    unlock_at?: ISO8601 | undefined;
    /** Display position. */
    position?: number | undefined;
    /** Whether to require sequential progress. */
    require_sequential_progress?: boolean | undefined;
    /** Prerequisite module IDs. */
    prerequisite_module_ids?: ModuleId[] | undefined;
    /** Whether to publish the module immediately. */
    published?: boolean | undefined;
  };
}

/**
 * Parameters accepted by `PUT /courses/:course_id/modules/:id` (update).
 */
export interface UpdateModuleParams {
  module: Partial<CreateModuleParams["module"]> & {
    /** Workflow state to move the module to. */
    workflow_state?: "active" | "deleted" | undefined;
  };
}
