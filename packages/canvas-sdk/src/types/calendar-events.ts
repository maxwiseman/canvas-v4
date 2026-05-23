/**
 * Types for the Canvas Calendar Events API.
 *
 * @see https://canvas.instructure.com/doc/api/calendar_events.html
 * @module types/calendar-events
 */

import type { CalendarEventId, ISO8601 } from "./common";

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

/**
 * Workflow state of a calendar event.
 */
export type CalendarEventWorkflowState = "active" | "locked" | "deleted";

/**
 * Type of context a calendar event belongs to.
 */
export type CalendarEventContextType = "Course" | "User" | "Group";

// ---------------------------------------------------------------------------
// Sub-objects
// ---------------------------------------------------------------------------

/**
 * Reservation of a time slot (for appointment groups).
 */
export interface CalendarEventReservation {
  /** Unique identifier. */
  id: number;
  /** ID of the parent time slot. */
  appointment_group_id: number;
  /** Start time. */
  start_at: ISO8601;
  /** End time. */
  end_at: ISO8601;
}

// ---------------------------------------------------------------------------
// Core type
// ---------------------------------------------------------------------------

/**
 * A Canvas calendar event.
 */
export interface CalendarEvent {
  /** Unique numeric identifier. */
  id: CalendarEventId;
  /** Event title. */
  title: string;
  /** ISO 8601 start time. */
  start_at: ISO8601;
  /** ISO 8601 end time. */
  end_at: ISO8601;
  /** HTML description of the event. */
  description: string;
  /** Physical location name. */
  location_name?: string | null | undefined;
  /** Physical location address. */
  location_address?: string | null | undefined;
  /** Workflow state. */
  workflow_state: CalendarEventWorkflowState;
  /** Whether the event is hidden. */
  hidden: boolean;
  /**
   * Context type.
   * @see {@link CalendarEventContextType}
   */
  context_type: CalendarEventContextType;
  /** ID of the owning context. */
  context_id: number;
  /**
   * Context code (e.g. `"course_123"`).
   * Used to identify the owning context.
   */
  context_code: string;
  /** Additional context codes this event is visible in. */
  effective_context_code?: string | undefined;
  /** All applicable context codes. */
  all_context_codes?: string | undefined;
  /** Whether the event lasts all day. */
  all_day: boolean;
  /** Date string for all-day events (YYYY-MM-DD). */
  all_day_date?: string | null | undefined;
  /** ISO 8601 creation timestamp. */
  created_at: ISO8601;
  /** ISO 8601 last-updated timestamp. */
  updated_at: ISO8601;
  /** URL to view the event in Canvas. */
  html_url: string;
  /** URL of the associated assignment (if the event is an assignment due date). */
  url?: string | undefined;
  /**
   * The associated assignment, if this is an assignment due-date event.
   * Present only when `include[]=assignment`.
   */
  assignment?: unknown | undefined;
  /** ID of the appointment group time slot (if applicable). */
  appointment_group_id?: number | null | undefined;
  /** URL for the appointment group. */
  appointment_group_url?: string | null | undefined;
  /** Own reservations for this time slot. */
  own_reservation?: boolean | undefined;
  /** Number of reservations (for time slots). */
  available_slots?: number | null | undefined;
  /** Number of reserved slots. */
  reserve_comments?: string | null | undefined;
  /** Participant type. */
  participant_type?: "User" | "Group" | undefined;
}

// ---------------------------------------------------------------------------
// Request parameter types
// ---------------------------------------------------------------------------

/**
 * Parameters accepted by `GET /calendar_events`.
 */
export interface ListCalendarEventsParams {
  /**
   * Event type filter.
   * - `"event"` — regular calendar events
   * - `"assignment"` — assignment due dates
   */
  type?: "event" | "assignment" | undefined;
  /** ISO 8601 start date (inclusive). */
  start_date?: ISO8601 | undefined;
  /** ISO 8601 end date (inclusive). */
  end_date?: ISO8601 | undefined;
  /** Filter to undated events. */
  undated?: boolean | undefined;
  /** Include all events for the user's courses, groups, etc. */
  all_events?: boolean | undefined;
  /**
   * Context codes to filter by.
   * @example ["course_123", "user_456"]
   */
  context_codes?: string[] | undefined;
  /**
   * Additional fields to include.
   * Common values: `"submission"`, `"assignment"`
   */
  include?: string[] | undefined;
  /** Filter to important date events only. */
  important_dates?: boolean | undefined;
  /** Exclude submission types. */
  excludes?: string[] | undefined;
  /** Filter by submission types. */
  submission_types?: string[] | undefined;
  /** Number of results per page. */
  per_page?: number | undefined;
}

/**
 * Parameters accepted by `POST /calendar_events` (create).
 */
export interface CreateCalendarEventParams {
  calendar_event: {
    /**
     * Context code for the owning context (required).
     * @example "course_123"
     */
    context_code: string;
    /** Event title. */
    title?: string | undefined;
    /** HTML description. */
    description?: string | undefined;
    /** ISO 8601 start time. */
    start_at?: ISO8601 | undefined;
    /** ISO 8601 end time. */
    end_at?: ISO8601 | undefined;
    /** Physical location name. */
    location_name?: string | undefined;
    /** Physical location address. */
    location_address?: string | undefined;
    /** Whether the event is all-day. */
    all_day?: boolean | undefined;
    /**
     * For recurring events: frequency and parameters.
     */
    rrule?: string | undefined;
    /** Whether to publish immediately. */
    published?: boolean | undefined;
  };
}

/**
 * Parameters accepted by `PUT /calendar_events/:id` (update).
 */
export interface UpdateCalendarEventParams {
  calendar_event: Partial<CreateCalendarEventParams["calendar_event"]>;
  /**
   * For recurring events: which events in the series to update.
   * - `"one"` — only this event.
   * - `"all"` — all events in the series.
   * - `"following"` — this and all following events.
   */
  which?: "one" | "all" | "following" | undefined;
}
