/**
 * Resource class for the Canvas Courses API.
 *
 * @module resources/courses
 */

import type { CanvasHttpClient } from "../http";
import { type CanvasPagedList } from "../http";
import type {
  AssignmentGroup,
  Course,
  CourseId,
  CourseSettings,
  CreateCourseParams,
  GetCourseParams,
  ListCoursesParams,
  UpdateCourseParams,
} from "../types/index";
import { AssignmentsResource } from "./assignments";
import { DiscussionsResource } from "./discussions";
import { EnrollmentsResource } from "./enrollments";
import { FilesResource } from "./files";
import { ModulesResource } from "./modules";
import { PagesResource } from "./pages";
import { QuizzesResource } from "./quizzes";
import { SubmissionsResource } from "./submissions";
import { AnnouncementsResource } from "./announcements";

/**
 * Provides access to Canvas course-level resources.
 *
 * Obtain an instance via `canvas.courses`.
 *
 * @example
 * ```ts
 * // List all active courses
 * for await (const course of canvas.courses.list()) {
 *   console.log(course.name);
 * }
 *
 * // Get a single course with teachers
 * const course = await canvas.courses.retrieve(12345, {
 *   include: ["teachers", "syllabus_body"],
 * });
 *
 * // Access nested resources
 * const assignments = canvas.courses.assignments(courseId);
 * const pages = canvas.courses.pages(courseId);
 * ```
 */
export class CoursesResource {
  readonly #http: CanvasHttpClient;

  /** @internal */
  constructor(http: CanvasHttpClient) {
    this.#http = http;
  }

  // ---------------------------------------------------------------------------
  // Core CRUD
  // ---------------------------------------------------------------------------

  /**
   * Returns a paginated list of courses for the current user.
   *
   * @param params - Optional filters and includes.
   *
   * @example
   * ```ts
   * // Collect all active courses
   * const courses = await canvas.courses.list({ enrollment_state: "active" }).all();
   *
   * // Iterate lazily
   * for await (const course of canvas.courses.list({ include: ["teachers"] })) {
   *   console.log(course.name, course.teachers?.[0]?.display_name);
   * }
   * ```
   */
  list(params?: ListCoursesParams): CanvasPagedList<Course> {
    return this.#http.getList<Course>("/courses", params as Record<string, unknown>);
  }

  /**
   * Returns a single course by ID.
   *
   * @param courseId - Numeric Canvas course ID.
   * @param params - Optional includes (e.g. `teachers`, `syllabus_body`).
   *
   * @throws {@link CanvasNotFoundError} if the course does not exist.
   *
   * @example
   * ```ts
   * const course = await canvas.courses.retrieve(12345, {
   *   include: ["syllabus_body", "teachers"],
   * });
   * console.log(course.syllabus_body);
   * ```
   */
  retrieve(courseId: CourseId | number, params?: GetCourseParams): Promise<Course> {
    return this.#http.get<Course>(`/courses/${courseId}`, params as Record<string, unknown>);
  }

  /**
   * Updates a course.
   *
   * @param courseId - Numeric Canvas course ID.
   * @param params - Fields to update.
   *
   * @example
   * ```ts
   * await canvas.courses.update(12345, {
   *   course: { name: "Updated Course Name" },
   * });
   * ```
   */
  update(courseId: CourseId | number, params: UpdateCourseParams): Promise<Course> {
    return this.#http.put<Course>(`/courses/${courseId}`, params);
  }

  /**
   * Creates a new course under an account.
   *
   * @param accountId - The account to create the course under.
   * @param params - Course creation parameters.
   *
   * @example
   * ```ts
   * const course = await canvas.courses.create(1, {
   *   course: { name: "New Course", course_code: "CS101" },
   * });
   * ```
   */
  create(accountId: number, params: CreateCourseParams): Promise<Course> {
    return this.#http.post<Course>(`/accounts/${accountId}/courses`, params);
  }

  /**
   * Deletes (concludes) a course.
   *
   * @param courseId - Numeric Canvas course ID.
   * @param event - `"delete"` to permanently delete, `"conclude"` to conclude.
   *
   * @example
   * ```ts
   * await canvas.courses.delete(12345, "conclude");
   * ```
   */
  delete(courseId: CourseId | number, event: "delete" | "conclude" = "delete"): Promise<{ delete: boolean } | { conclude: boolean }> {
    return this.#http.delete(`/courses/${courseId}?event=${event}`);
  }

  // ---------------------------------------------------------------------------
  // Additional course-level endpoints
  // ---------------------------------------------------------------------------

  /**
   * Returns the course settings.
   *
   * @param courseId - Numeric Canvas course ID.
   *
   * @example
   * ```ts
   * const settings = await canvas.courses.settings(12345);
   * console.log(settings.hide_final_grades);
   * ```
   */
  settings(courseId: CourseId | number): Promise<CourseSettings> {
    return this.#http.get<CourseSettings>(`/courses/${courseId}/settings`);
  }

  /**
   * Returns the assignment groups for a course.
   *
   * @param courseId - Numeric Canvas course ID.
   * @param params - Optional includes.
   *
   * @example
   * ```ts
   * const groups = await canvas.courses.assignmentGroups(12345).all();
   * ```
   */
  assignmentGroups(
    courseId: CourseId | number,
    params?: { include?: string[]; per_page?: number },
  ): CanvasPagedList<AssignmentGroup> {
    return this.#http.getList<AssignmentGroup>(
      `/courses/${courseId}/assignment_groups`,
      params as Record<string, unknown>,
    );
  }

  // ---------------------------------------------------------------------------
  // Nested resource factories
  // ---------------------------------------------------------------------------

  /**
   * Returns an {@link AssignmentsResource} scoped to the given course.
   *
   * @param courseId - Numeric Canvas course ID.
   *
   * @example
   * ```ts
   * const assignments = canvas.courses.assignments(12345);
   * for await (const a of assignments.list({ bucket: "upcoming" })) {
   *   console.log(a.name, a.due_at);
   * }
   * ```
   */
  assignments(courseId: CourseId | number): AssignmentsResource {
    return new AssignmentsResource(this.#http, courseId);
  }

  /**
   * Returns a {@link SubmissionsResource} scoped to the given course.
   *
   * @param courseId - Numeric Canvas course ID.
   */
  submissions(courseId: CourseId | number): SubmissionsResource {
    return new SubmissionsResource(this.#http, courseId);
  }

  /**
   * Returns an {@link EnrollmentsResource} scoped to the given course.
   *
   * @param courseId - Numeric Canvas course ID.
   *
   * @example
   * ```ts
   * const enrollments = canvas.courses.enrollments(12345);
   * const students = await enrollments.list({ type: ["StudentEnrollment"] }).all();
   * ```
   */
  enrollments(courseId: CourseId | number): EnrollmentsResource {
    return new EnrollmentsResource(this.#http, courseId);
  }

  /**
   * Returns a {@link ModulesResource} scoped to the given course.
   *
   * @param courseId - Numeric Canvas course ID.
   *
   * @example
   * ```ts
   * const modules = canvas.courses.modules(12345);
   * for await (const mod of modules.list({ include: ["items"] })) {
   *   console.log(mod.name, mod.items?.length);
   * }
   * ```
   */
  modules(courseId: CourseId | number): ModulesResource {
    return new ModulesResource(this.#http, courseId);
  }

  /**
   * Returns a {@link PagesResource} scoped to the given course.
   *
   * @param courseId - Numeric Canvas course ID.
   *
   * @example
   * ```ts
   * const pages = canvas.courses.pages(12345);
   * const frontPage = await pages.retrieveFrontPage();
   * ```
   */
  pages(courseId: CourseId | number): PagesResource {
    return new PagesResource(this.#http, courseId);
  }

  /**
   * Returns a {@link FilesResource} scoped to the given course.
   *
   * @param courseId - Numeric Canvas course ID.
   */
  files(courseId: CourseId | number): FilesResource {
    return new FilesResource(this.#http, courseId);
  }

  /**
   * Returns a {@link DiscussionsResource} scoped to the given course.
   *
   * @param courseId - Numeric Canvas course ID.
   *
   * @example
   * ```ts
   * const discussions = canvas.courses.discussions(12345);
   * for await (const d of discussions.list()) {
   *   console.log(d.title);
   * }
   * ```
   */
  discussions(courseId: CourseId | number): DiscussionsResource {
    return new DiscussionsResource(this.#http, courseId);
  }

  /**
   * Returns a {@link QuizzesResource} scoped to the given course.
   *
   * @param courseId - Numeric Canvas course ID.
   */
  quizzes(courseId: CourseId | number): QuizzesResource {
    return new QuizzesResource(this.#http, courseId);
  }

  /**
   * Returns an {@link AnnouncementsResource} scoped to the given course.
   *
   * @param courseId - Numeric Canvas course ID.
   *
   * @example
   * ```ts
   * const recent = await canvas.courses.announcements(12345).list().all();
   * ```
   */
  announcements(courseId: CourseId | number): AnnouncementsResource {
    return new AnnouncementsResource(this.#http, courseId);
  }
}
