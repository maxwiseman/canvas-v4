/**
 * Resource class for the Canvas Enrollments API.
 *
 * @module resources/enrollments
 */

import type { CanvasHttpClient, CanvasPagedList } from "../http";
import type {
  CourseId,
  Enrollment,
  EnrollmentId,
  EnrollUserParams,
  ListEnrollmentsParams,
} from "../types/index";

/**
 * Provides access to enrollments within a course.
 *
 * Obtain an instance via `canvas.courses.enrollments(courseId)`.
 *
 * @example
 * ```ts
 * const enrollments = canvas.courses.enrollments(12345);
 *
 * // List all students
 * const students = await enrollments.list({
 *   type: ["StudentEnrollment"],
 *   include: ["grades"],
 * }).all();
 *
 * // Enroll a user
 * await enrollments.enroll({
 *   enrollment: {
 *     user_id: userId,
 *     type: "StudentEnrollment",
 *     enrollment_state: "active",
 *   },
 * });
 * ```
 */
export class EnrollmentsResource {
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
   * Returns a paginated list of enrollments for the course.
   *
   * @param params - Optional filters and includes.
   *
   * @example
   * ```ts
   * const activeStudents = await enrollments.list({
   *   type: ["StudentEnrollment"],
   *   state: ["active"],
   * }).all();
   * ```
   */
  list(params?: ListEnrollmentsParams): CanvasPagedList<Enrollment> {
    return this.#http.getList<Enrollment>(
      `/courses/${this.#courseId}/enrollments`,
      params as Record<string, unknown>,
    );
  }

  /**
   * Returns a single enrollment by ID.
   *
   * @param enrollmentId - Numeric Canvas enrollment ID.
   */
  retrieve(enrollmentId: EnrollmentId | number): Promise<Enrollment> {
    return this.#http.get<Enrollment>(`/enrollments/${enrollmentId}`);
  }

  /**
   * Enrolls a user into the course.
   *
   * @param params - Enrollment parameters.
   *
   * @example
   * ```ts
   * await enrollments.enroll({
   *   enrollment: {
   *     user_id: 42,
   *     type: "StudentEnrollment",
   *     enrollment_state: "active",
   *     notify: true,
   *   },
   * });
   * ```
   */
  enroll(params: EnrollUserParams): Promise<Enrollment> {
    return this.#http.post<Enrollment>(
      `/courses/${this.#courseId}/enrollments`,
      params,
    );
  }

  /**
   * Deactivates (concludes or deletes) an enrollment.
   *
   * @param enrollmentId - Numeric Canvas enrollment ID.
   * @param task - What action to take.
   *   - `"conclude"` — conclude the enrollment (preserves grades).
   *   - `"delete"` — permanently remove the enrollment.
   *   - `"inactivate"` — mark as inactive.
   *   - `"deactivate"` — same as inactivate.
   */
  deactivate(
    enrollmentId: EnrollmentId | number,
    task: "conclude" | "delete" | "inactivate" | "deactivate" = "conclude",
  ): Promise<Enrollment> {
    return this.#http.delete<Enrollment>(
      `/courses/${this.#courseId}/enrollments/${enrollmentId}?task=${task}`,
    );
  }

  /**
   * Re-activates an inactive enrollment.
   *
   * @param enrollmentId - Numeric Canvas enrollment ID.
   */
  reactivate(enrollmentId: EnrollmentId | number): Promise<Enrollment> {
    return this.#http.put<Enrollment>(
      `/courses/${this.#courseId}/enrollments/${enrollmentId}/reactivate`,
    );
  }
}
