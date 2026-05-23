/**
 * Resource class for the Canvas Calendar Events API.
 *
 * @module resources/calendar-events
 */

import type { CanvasHttpClient, CanvasPagedList } from "../http";
import type {
  CalendarEvent,
  CalendarEventId,
  CreateCalendarEventParams,
  ListCalendarEventsParams,
  UpdateCalendarEventParams,
} from "../types/index";

/**
 * Provides access to Calendar Events.
 *
 * Obtain an instance via `canvas.calendarEvents`.
 *
 * @example
 * ```ts
 * // List upcoming events for the current user
 * for await (const event of canvas.calendarEvents.list({
 *   start_date: new Date().toISOString(),
 *   end_date: "2024-12-31T00:00:00Z",
 * })) {
 *   console.log(event.title, event.start_at);
 * }
 *
 * // List assignment due dates for a specific course
 * const dueDates = await canvas.calendarEvents.list({
 *   type: "assignment",
 *   context_codes: ["course_12345"],
 * }).all();
 * ```
 */
export class CalendarEventsResource {
  readonly #http: CanvasHttpClient;

  /** @internal */
  constructor(http: CanvasHttpClient) {
    this.#http = http;
  }

  // ---------------------------------------------------------------------------
  // Core CRUD
  // ---------------------------------------------------------------------------

  /**
   * Returns a paginated list of calendar events.
   *
   * @param params - Filters including date range and context codes.
   *
   * @example
   * ```ts
   * const events = await canvas.calendarEvents.list({
   *   context_codes: ["course_12345"],
   *   start_date: "2024-09-01T00:00:00Z",
   * }).all();
   * ```
   */
  list(params?: ListCalendarEventsParams): CanvasPagedList<CalendarEvent> {
    return this.#http.getList<CalendarEvent>(
      "/calendar_events",
      params as Record<string, unknown>,
    );
  }

  /**
   * Returns a single calendar event by ID.
   *
   * @param eventId - Numeric Canvas calendar event ID.
   */
  retrieve(eventId: CalendarEventId | number): Promise<CalendarEvent> {
    return this.#http.get<CalendarEvent>(`/calendar_events/${eventId}`);
  }

  /**
   * Creates a new calendar event.
   *
   * @param params - Event creation parameters.
   *
   * @example
   * ```ts
   * const event = await canvas.calendarEvents.create({
   *   calendar_event: {
   *     context_code: "course_12345",
   *     title: "Office Hours",
   *     start_at: "2024-10-15T14:00:00Z",
   *     end_at: "2024-10-15T15:00:00Z",
   *     location_name: "Room 201",
   *   },
   * });
   * ```
   */
  create(params: CreateCalendarEventParams): Promise<CalendarEvent> {
    return this.#http.post<CalendarEvent>("/calendar_events", params);
  }

  /**
   * Updates a calendar event.
   *
   * @param eventId - Numeric Canvas calendar event ID.
   * @param params - Fields to update.
   */
  update(
    eventId: CalendarEventId | number,
    params: UpdateCalendarEventParams,
  ): Promise<CalendarEvent> {
    return this.#http.put<CalendarEvent>(`/calendar_events/${eventId}`, params);
  }

  /**
   * Deletes a calendar event.
   *
   * @param eventId - Numeric Canvas calendar event ID.
   * @param cancelReason - Optional reason shown to participants.
   */
  delete(eventId: CalendarEventId | number, cancelReason?: string): Promise<CalendarEvent> {
    const path = cancelReason
      ? `/calendar_events/${eventId}?cancel_reason=${encodeURIComponent(cancelReason)}`
      : `/calendar_events/${eventId}`;
    return this.#http.delete<CalendarEvent>(path);
  }
}
