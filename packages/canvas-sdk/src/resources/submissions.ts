/**
 * Resource class for the Canvas Submissions API.
 *
 * @module resources/submissions
 */

import type { CanvasHttpClient, CanvasPagedList } from "../http";
import type {
  AssignmentId,
  CourseId,
  CreateSubmissionParams,
  GradeSubmissionParams,
  ListStudentSubmissionsParams,
  ListSubmissionsParams,
  Submission,
  UserId,
} from "../types/index";

/**
 * Provides access to assignment submissions within a course.
 *
 * Obtain an instance via `canvas.courses.submissions(courseId)`.
 *
 * @example
 * ```ts
 * const submissions = canvas.courses.submissions(courseId);
 *
 * // Get the current user's submission for an assignment
 * const sub = await submissions.retrieveForSelf(assignmentId);
 *
 * // List all submissions for an assignment (instructor)
 * for await (const s of submissions.listForAssignment(assignmentId)) {
 *   console.log(s.user_id, s.score);
 * }
 * ```
 */
export class SubmissionsResource {
  readonly #http: CanvasHttpClient;
  readonly #courseId: CourseId | number;

  /** @internal */
  constructor(http: CanvasHttpClient, courseId: CourseId | number) {
    this.#http = http;
    this.#courseId = courseId;
  }

  // ---------------------------------------------------------------------------
  // Listing
  // ---------------------------------------------------------------------------

  /**
   * Returns all submissions for a specific assignment.
   * Primarily useful for instructors.
   *
   * @param assignmentId - Numeric Canvas assignment ID.
   * @param params - Optional filters and includes.
   *
   * @example
   * ```ts
   * const subs = await submissions
   *   .listForAssignment(assignmentId, { include: ["submission_comments"] })
   *   .all();
   * ```
   */
  listForAssignment(
    assignmentId: AssignmentId | number,
    params?: ListSubmissionsParams,
  ): CanvasPagedList<Submission> {
    return this.#http.getList<Submission>(
      `/courses/${this.#courseId}/assignments/${assignmentId}/submissions`,
      params as Record<string, unknown>,
    );
  }

  /**
   * Returns all submissions for the current user across multiple assignments.
   *
   * @param params - Optional filters including `assignment_ids` and `student_ids`.
   */
  listForStudent(params?: ListStudentSubmissionsParams): CanvasPagedList<Submission> {
    return this.#http.getList<Submission>(
      `/courses/${this.#courseId}/students/submissions`,
      params as Record<string, unknown>,
    );
  }

  // ---------------------------------------------------------------------------
  // Retrieval
  // ---------------------------------------------------------------------------

  /**
   * Returns a single submission for a given assignment and user.
   *
   * @param assignmentId - Numeric Canvas assignment ID.
   * @param userId - Numeric Canvas user ID, or `"self"` for the current user.
   * @param params - Optional includes.
   *
   * @example
   * ```ts
   * const sub = await submissions.retrieve(assignmentId, "self", {
   *   include: ["submission_comments", "rubric_assessment"],
   * });
   * ```
   */
  retrieve(
    assignmentId: AssignmentId | number,
    userId: UserId | number | "self",
    params?: ListSubmissionsParams,
  ): Promise<Submission> {
    return this.#http.get<Submission>(
      `/courses/${this.#courseId}/assignments/${assignmentId}/submissions/${userId}`,
      params as Record<string, unknown>,
    );
  }

  /**
   * Convenience method: returns the current user's submission.
   *
   * @param assignmentId - Numeric Canvas assignment ID.
   * @param params - Optional includes.
   */
  retrieveForSelf(
    assignmentId: AssignmentId | number,
    params?: ListSubmissionsParams,
  ): Promise<Submission> {
    return this.retrieve(assignmentId, "self", params);
  }

  // ---------------------------------------------------------------------------
  // Creating / submitting
  // ---------------------------------------------------------------------------

  /**
   * Submits an assignment on behalf of the current user (or a specified user).
   *
   * @param assignmentId - Numeric Canvas assignment ID.
   * @param params - Submission parameters.
   *
   * @example
   * ```ts
   * // Text entry submission
   * await submissions.submit(assignmentId, {
   *   submission: {
   *     submission_type: "online_text_entry",
   *     body: "<p>My answer here.</p>",
   *   },
   * });
   *
   * // File upload (requires pre-uploaded file IDs)
   * await submissions.submit(assignmentId, {
   *   submission: {
   *     submission_type: "online_upload",
   *     file_ids: [fileId1, fileId2],
   *   },
   * });
   *
   * // URL submission
   * await submissions.submit(assignmentId, {
   *   submission: {
   *     submission_type: "online_url",
   *     url: "https://example.com/my-project",
   *   },
   * });
   * ```
   */
  submit(
    assignmentId: AssignmentId | number,
    params: CreateSubmissionParams,
  ): Promise<Submission> {
    return this.#http.post<Submission>(
      `/courses/${this.#courseId}/assignments/${assignmentId}/submissions`,
      params,
    );
  }

  // ---------------------------------------------------------------------------
  // Grading
  // ---------------------------------------------------------------------------

  /**
   * Grades (or comments on) a submission.
   * Requires instructor permissions.
   *
   * @param assignmentId - Numeric Canvas assignment ID.
   * @param userId - Numeric Canvas user ID, or `"self"`.
   * @param params - Grade and/or comment parameters.
   *
   * @example
   * ```ts
   * // Grade a submission
   * await submissions.grade(assignmentId, studentId, {
   *   submission: { posted_grade: "95" },
   *   comment: { text_comment: "Great work!" },
   * });
   *
   * // Excuse a submission
   * await submissions.grade(assignmentId, studentId, {
   *   submission: { excuse: true },
   * });
   * ```
   */
  grade(
    assignmentId: AssignmentId | number,
    userId: UserId | number,
    params: GradeSubmissionParams,
  ): Promise<Submission> {
    return this.#http.put<Submission>(
      `/courses/${this.#courseId}/assignments/${assignmentId}/submissions/${userId}`,
      params,
    );
  }
}
