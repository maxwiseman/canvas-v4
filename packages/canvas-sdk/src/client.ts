/**
 * The main Canvas LMS API client.
 *
 * @module client
 */

import { CanvasHttpClient, type HttpClientOptions } from "./http";
import { CalendarEventsResource } from "./resources/calendar-events";
import { CoursesResource } from "./resources/courses";
import { FilesResource } from "./resources/files";
import { UsersResource } from "./resources/users";

// ---------------------------------------------------------------------------
// Client options
// ---------------------------------------------------------------------------

/**
 * Configuration for the {@link CanvasClient}.
 */
export interface CanvasClientOptions {
  /**
   * Canvas API access token.
   *
   * Generate one in Canvas under **Account → Settings → Approved Integrations**.
   * For production applications use OAuth 2.0 instead of a personal token.
   */
  token: string;
  /**
   * Hostname of the Canvas instance, **without** a trailing slash and
   * **without** a scheme.
   *
   * @example "school.instructure.com"
   * @example "canvas.myuniversity.edu"
   */
  domain: string;
  /**
   * Maximum number of items to request per page when the caller does not
   * specify `per_page`.
   *
   * @default 100
   */
  defaultPerPage?: number;
  /**
   * Custom `fetch` implementation.
   *
   * Useful for testing (provide a mock) or in environments that need
   * a custom transport (e.g. adding logging middleware).
   *
   * @default globalThis.fetch
   */
  fetch?: typeof globalThis.fetch;
}

// ---------------------------------------------------------------------------
// CanvasClient
// ---------------------------------------------------------------------------

/**
 * The top-level Canvas LMS API client.
 *
 * Construct one instance per user/token and reuse it throughout your
 * application. All resource objects returned by the client share the same
 * underlying HTTP connection configuration.
 *
 * ### Quick-start
 *
 * ```ts
 * import { CanvasClient } from "@maxw-ai/canvas";
 *
 * const canvas = new CanvasClient({
 *   token: process.env.CANVAS_API_TOKEN!,
 *   domain: "school.instructure.com",
 * });
 *
 * // List all active courses
 * for await (const course of canvas.courses.list()) {
 *   console.log(course.name);
 * }
 *
 * // Get the current user
 * const me = await canvas.users.retrieveSelf();
 *
 * // Assignments for a specific course
 * const upcoming = await canvas.courses
 *   .assignments(courseId)
 *   .list({ bucket: "upcoming", include: ["submission"] })
 *   .all();
 * ```
 *
 * ### Error handling
 *
 * All HTTP errors are thrown as typed subclasses of {@link CanvasAPIError}:
 *
 * ```ts
 * import { CanvasNotFoundError, CanvasAuthenticationError } from "@maxw-ai/canvas";
 *
 * try {
 *   await canvas.courses.retrieve(99999);
 * } catch (err) {
 *   if (err instanceof CanvasNotFoundError) {
 *     console.error("Course not found");
 *   } else if (err instanceof CanvasAuthenticationError) {
 *     console.error("Invalid or expired token");
 *   } else {
 *     throw err;
 *   }
 * }
 * ```
 *
 * ### Pagination
 *
 * List methods return a {@link CanvasPagedList} which implements `AsyncIterable`.
 *
 * ```ts
 * // Lazy iteration (memory efficient)
 * for await (const assignment of canvas.courses.assignments(courseId).list()) {
 *   process(assignment);
 * }
 *
 * // Collect all into an array
 * const all = await canvas.courses.assignments(courseId).list().all();
 *
 * // Manual pagination
 * const list = canvas.courses.list();
 * const page1 = await list.firstPage();
 * if (page1.hasMore) {
 *   const page2 = await list.nextPage();
 * }
 * ```
 */
export class CanvasClient {
  /** @internal */
  readonly _http: CanvasHttpClient;

  /**
   * Access course resources.
   *
   * @example
   * ```ts
   * const courses = await canvas.courses.list().all();
   * const course = await canvas.courses.retrieve(courseId);
   *
   * // Nested resources
   * const assignments = canvas.courses.assignments(courseId);
   * const pages = canvas.courses.pages(courseId);
   * const modules = canvas.courses.modules(courseId);
   * ```
   */
  readonly courses: CoursesResource;

  /**
   * Access user resources.
   *
   * @example
   * ```ts
   * const me = await canvas.users.retrieveSelf();
   * const todos = await canvas.users.todoItems();
   * ```
   */
  readonly users: UsersResource;

  /**
   * Access calendar events.
   *
   * @example
   * ```ts
   * const events = await canvas.calendarEvents.list({
   *   context_codes: ["course_12345"],
   *   start_date: new Date().toISOString(),
   * }).all();
   * ```
   */
  readonly calendarEvents: CalendarEventsResource;

  /**
   * Access files at the user level (not scoped to a course).
   * For course-scoped files use `canvas.courses.files(courseId)`.
   *
   * @example
   * ```ts
   * const file = await canvas.files.retrieve(fileId);
   * console.log(file.url);
   * ```
   */
  readonly files: FilesResource;

  // ---------------------------------------------------------------------------

  constructor(options: CanvasClientOptions) {
    const httpOptions: HttpClientOptions = {
      token: options.token,
      domain: options.domain,
      ...(options.defaultPerPage !== undefined && { defaultPerPage: options.defaultPerPage }),
      ...(options.fetch !== undefined && { fetch: options.fetch }),
    };
    this._http = new CanvasHttpClient(httpOptions);

    this.courses = new CoursesResource(this._http);
    this.users = new UsersResource(this._http);
    this.calendarEvents = new CalendarEventsResource(this._http);
    this.files = new FilesResource(this._http);
  }
}
