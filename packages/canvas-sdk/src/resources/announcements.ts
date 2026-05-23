/**
 * Resource class for the Canvas Announcements API.
 *
 * Announcements are a specialised type of discussion topic. This resource
 * wraps the global `/announcements` endpoint which is scoped by context codes.
 *
 * @module resources/announcements
 */

import type { CanvasHttpClient, CanvasPagedList } from "../http";
import type {
  Announcement,
  CourseId,
  CreateAnnouncementParams,
  ListAnnouncementsParams,
} from "../types/index";

/**
 * Provides access to announcements within a course.
 *
 * Obtain an instance via `canvas.courses.announcements(courseId)`.
 *
 * @example
 * ```ts
 * const announcements = canvas.courses.announcements(12345);
 *
 * // List recent announcements
 * for await (const a of announcements.list()) {
 *   console.log(a.title, a.posted_at);
 * }
 * ```
 */
export class AnnouncementsResource {
  readonly #http: CanvasHttpClient;
  readonly #courseId: CourseId | number;

  /** @internal */
  constructor(http: CanvasHttpClient, courseId: CourseId | number) {
    this.#http = http;
    this.#courseId = courseId;
  }

  // ---------------------------------------------------------------------------
  // Core operations
  // ---------------------------------------------------------------------------

  /**
   * Returns a paginated list of announcements for the course.
   *
   * @param params - Optional filters (e.g. date range, active only).
   *
   * @example
   * ```ts
   * const recent = await announcements.list({
   *   start_date: "2024-09-01T00:00:00Z",
   *   active_only: true,
   * }).all();
   * ```
   */
  list(
    params?: Omit<ListAnnouncementsParams, "context_codes">,
  ): CanvasPagedList<Announcement> {
    const merged: ListAnnouncementsParams = {
      ...params,
      context_codes: [`course_${this.#courseId}`],
    };
    return this.#http.getList<Announcement>(
      "/announcements",
      merged as unknown as Record<string, unknown>,
    );
  }

  /**
   * Creates a new announcement in the course.
   *
   * Announcements are posted via the discussion topics endpoint with
   * `is_announcement: true` set automatically.
   *
   * @param params - Announcement creation parameters.
   *
   * @example
   * ```ts
   * await announcements.create({
   *   title: "Welcome to the course!",
   *   message: "<p>Looking forward to a great semester.</p>",
   *   published: true,
   * });
   * ```
   */
  create(params: CreateAnnouncementParams): Promise<Announcement> {
    return this.#http.post<Announcement>(
      `/courses/${this.#courseId}/discussion_topics`,
      { ...params, is_announcement: true },
    );
  }
}
