/**
 * Resource class for the Canvas Pages (Wiki) API.
 *
 * @module resources/pages
 */

import type { CanvasHttpClient, CanvasPagedList } from "../http";
import type {
  CourseId,
  CreatePageParams,
  GetPageParams,
  ListPagesParams,
  Page,
  UpdatePageParams,
} from "../types/index";

/**
 * Provides access to wiki pages within a course.
 *
 * Obtain an instance via `canvas.courses.pages(courseId)`.
 *
 * @example
 * ```ts
 * const pages = canvas.courses.pages(12345);
 *
 * // List published pages
 * for await (const page of pages.list({ published: true })) {
 *   console.log(page.title, page.url);
 * }
 *
 * // Get the front page
 * const front = await pages.retrieveFrontPage();
 * console.log(front.body);
 * ```
 */
export class PagesResource {
  readonly #http: CanvasHttpClient;
  readonly #courseId: CourseId | number;

  /** @internal */
  constructor(http: CanvasHttpClient, courseId: CourseId | number) {
    this.#http = http;
    this.#courseId = courseId;
  }

  // ---------------------------------------------------------------------------
  // Core CRUD
  // ---------------------------------------------------------------------------

  /**
   * Returns a paginated list of pages for the course.
   *
   * @param params - Optional filters and includes.
   *
   * @example
   * ```ts
   * const allPages = await pages.list().all();
   * ```
   */
  list(params?: ListPagesParams): CanvasPagedList<Page> {
    return this.#http.getList<Page>(
      `/courses/${this.#courseId}/pages`,
      params as Record<string, unknown>,
    );
  }

  /**
   * Returns a single page by its URL slug or ID.
   *
   * @param urlOrId - The page URL slug (e.g. `"course-syllabus"`) or numeric ID.
   * @param params - Optional includes.
   *
   * @example
   * ```ts
   * const page = await pages.retrieve("course-syllabus");
   * console.log(page.body);
   * ```
   */
  retrieve(urlOrId: string | number, params?: GetPageParams): Promise<Page> {
    return this.#http.get<Page>(
      `/courses/${this.#courseId}/pages/${urlOrId}`,
      params as Record<string, unknown>,
    );
  }

  /**
   * Returns the course's front page.
   *
   * @example
   * ```ts
   * const front = await pages.retrieveFrontPage();
   * ```
   */
  retrieveFrontPage(): Promise<Page> {
    return this.#http.get<Page>(`/courses/${this.#courseId}/front_page`);
  }

  /**
   * Creates a new page.
   *
   * @param params - Page creation parameters.
   *
   * @example
   * ```ts
   * const page = await pages.create({
   *   wiki_page: {
   *     title: "Week 1 Notes",
   *     body: "<p>Content goes here.</p>",
   *     published: true,
   *   },
   * });
   * ```
   */
  create(params: CreatePageParams): Promise<Page> {
    return this.#http.post<Page>(`/courses/${this.#courseId}/pages`, params);
  }

  /**
   * Updates a page.
   *
   * @param urlOrId - The page URL slug or numeric ID.
   * @param params - Fields to update.
   *
   * @example
   * ```ts
   * await pages.update("course-syllabus", {
   *   wiki_page: { body: "<p>Updated content.</p>" },
   * });
   * ```
   */
  update(urlOrId: string | number, params: UpdatePageParams): Promise<Page> {
    return this.#http.put<Page>(
      `/courses/${this.#courseId}/pages/${urlOrId}`,
      params,
    );
  }

  /**
   * Deletes a page.
   *
   * @param urlOrId - The page URL slug or numeric ID.
   */
  delete(urlOrId: string | number): Promise<Page> {
    return this.#http.delete<Page>(
      `/courses/${this.#courseId}/pages/${urlOrId}`,
    );
  }

  /**
   * Updates the course's front page.
   *
   * @param params - Fields to update.
   */
  updateFrontPage(params: UpdatePageParams): Promise<Page> {
    return this.#http.put<Page>(
      `/courses/${this.#courseId}/front_page`,
      params,
    );
  }
}
