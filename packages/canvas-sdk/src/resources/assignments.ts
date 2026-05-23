/**
 * Resource class for the Canvas Assignments API.
 *
 * @module resources/assignments
 */

import type { CanvasHttpClient, CanvasPagedList } from "../http";
import type {
  Assignment,
  AssignmentId,
  CourseId,
  CreateAssignmentParams,
  GetAssignmentParams,
  ListAssignmentsParams,
  UpdateAssignmentParams,
} from "../types/index";

/**
 * Provides access to assignments within a course.
 *
 * Obtain an instance via `canvas.courses.assignments(courseId)`.
 *
 * @example
 * ```ts
 * const assignments = canvas.courses.assignments(12345);
 *
 * // List upcoming assignments
 * for await (const a of assignments.list({ bucket: "upcoming" })) {
 *   console.log(a.name, a.due_at);
 * }
 *
 * // Get a specific assignment with submission data
 * const assignment = await assignments.retrieve(67890, {
 *   include: ["submission"],
 * });
 * ```
 */
export class AssignmentsResource {
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
   * Returns a paginated list of assignments for the course.
   *
   * @param params - Optional filters and includes.
   *
   * @example
   * ```ts
   * // All overdue assignments with submission info
   * const overdue = await assignments.list({
   *   bucket: "overdue",
   *   include: ["submission"],
   * }).all();
   * ```
   */
  list(params?: ListAssignmentsParams): CanvasPagedList<Assignment> {
    return this.#http.getList<Assignment>(
      `/courses/${this.#courseId}/assignments`,
      params as Record<string, unknown>,
    );
  }

  /**
   * Returns a single assignment by ID.
   *
   * @param assignmentId - Numeric Canvas assignment ID.
   * @param params - Optional includes.
   *
   * @throws {@link CanvasNotFoundError} if the assignment does not exist.
   *
   * @example
   * ```ts
   * const assignment = await assignments.retrieve(67890, {
   *   include: ["submission", "rubric_assessment"],
   * });
   * ```
   */
  retrieve(
    assignmentId: AssignmentId | number,
    params?: GetAssignmentParams,
  ): Promise<Assignment> {
    return this.#http.get<Assignment>(
      `/courses/${this.#courseId}/assignments/${assignmentId}`,
      params as Record<string, unknown>,
    );
  }

  /**
   * Creates a new assignment in the course.
   *
   * @param params - Assignment creation parameters.
   *
   * @example
   * ```ts
   * const assignment = await assignments.create({
   *   assignment: {
   *     name: "Essay #1",
   *     points_possible: 100,
   *     due_at: "2024-10-15T23:59:00Z",
   *     submission_types: ["online_text_entry"],
   *     published: true,
   *   },
   * });
   * ```
   */
  create(params: CreateAssignmentParams): Promise<Assignment> {
    return this.#http.post<Assignment>(
      `/courses/${this.#courseId}/assignments`,
      params,
    );
  }

  /**
   * Updates an existing assignment.
   *
   * @param assignmentId - Numeric Canvas assignment ID.
   * @param params - Fields to update.
   *
   * @example
   * ```ts
   * await assignments.update(67890, {
   *   assignment: { due_at: "2024-11-01T23:59:00Z" },
   * });
   * ```
   */
  update(
    assignmentId: AssignmentId | number,
    params: UpdateAssignmentParams,
  ): Promise<Assignment> {
    return this.#http.put<Assignment>(
      `/courses/${this.#courseId}/assignments/${assignmentId}`,
      params,
    );
  }

  /**
   * Deletes an assignment.
   *
   * @param assignmentId - Numeric Canvas assignment ID.
   */
  delete(assignmentId: AssignmentId | number): Promise<Assignment> {
    return this.#http.delete<Assignment>(
      `/courses/${this.#courseId}/assignments/${assignmentId}`,
    );
  }
}
