/**
 * Resource class for the Canvas Quizzes API.
 *
 * @module resources/quizzes
 */

import { CanvasNotFoundError } from "../errors";
import type { CanvasHttpClient, CanvasPagedList } from "../http";
import type {
  CourseId,
  CreateQuizParams,
  ListQuizzesParams,
  Quiz,
  QuizId,
  QuizQuestion,
  QuizSubmission,
  UpdateQuizParams,
} from "../types/index";

/**
 * Provides access to quizzes within a course.
 *
 * Obtain an instance via `canvas.courses.quizzes(courseId)`.
 *
 * @example
 * ```ts
 * const quizzes = canvas.courses.quizzes(12345);
 *
 * // List all published quizzes
 * for await (const quiz of quizzes.list()) {
 *   if (quiz.published) console.log(quiz.title, quiz.due_at);
 * }
 *
 * // Get a quiz with questions
 * const quiz = await quizzes.retrieve(quizId, { include: ["questions"] });
 * ```
 */
export class QuizzesResource {
  readonly #http: CanvasHttpClient;
  readonly #courseId: CourseId | number;

  /** @internal */
  constructor(http: CanvasHttpClient, courseId: CourseId | number) {
    this.#http = http;
    this.#courseId = courseId;
  }

  // ---------------------------------------------------------------------------
  // Quizzes
  // ---------------------------------------------------------------------------

  /**
   * Returns a paginated list of quizzes for the course.
   *
   * @param params - Optional filters.
   */
  list(params?: ListQuizzesParams): CanvasPagedList<Quiz> {
    return this.#http.getList<Quiz>(
      `/courses/${this.#courseId}/quizzes`,
      params as Record<string, unknown>,
    );
  }

  /**
   * Returns a single quiz by ID.
   *
   * @param quizId - Numeric Canvas quiz ID.
   * @param params - Optional includes (e.g. `questions`).
   */
  retrieve(quizId: QuizId | number, params?: { include?: string[] }): Promise<Quiz> {
    return this.#http.get<Quiz>(
      `/courses/${this.#courseId}/quizzes/${quizId}`,
      params as Record<string, unknown>,
    );
  }

  /**
   * Creates a new quiz.
   *
   * @param params - Quiz creation parameters.
   */
  create(params: CreateQuizParams): Promise<Quiz> {
    return this.#http.post<Quiz>(`/courses/${this.#courseId}/quizzes`, params);
  }

  /**
   * Updates a quiz.
   *
   * @param quizId - Numeric Canvas quiz ID.
   * @param params - Fields to update.
   */
  update(quizId: QuizId | number, params: UpdateQuizParams): Promise<Quiz> {
    return this.#http.put<Quiz>(
      `/courses/${this.#courseId}/quizzes/${quizId}`,
      params,
    );
  }

  /**
   * Deletes a quiz.
   *
   * @param quizId - Numeric Canvas quiz ID.
   */
  delete(quizId: QuizId | number): Promise<Quiz> {
    return this.#http.delete<Quiz>(
      `/courses/${this.#courseId}/quizzes/${quizId}`,
    );
  }

  // ---------------------------------------------------------------------------
  // Quiz questions
  // ---------------------------------------------------------------------------

  /**
   * Returns all questions in a quiz.
   *
   * @param quizId - Numeric Canvas quiz ID.
   * @param params - Optional filters.
   */
  listQuestions(
    quizId: QuizId | number,
    params?: { quiz_submission_id?: number; quiz_submission_attempt?: number; per_page?: number },
  ): CanvasPagedList<QuizQuestion> {
    return this.#http.getList<QuizQuestion>(
      `/courses/${this.#courseId}/quizzes/${quizId}/questions`,
      params as Record<string, unknown>,
    );
  }

  // ---------------------------------------------------------------------------
  // Quiz submissions
  // ---------------------------------------------------------------------------

  /**
   * Returns all submissions for a quiz.
   * Instructor-only for full results; students see their own.
   *
   * @param quizId - Numeric Canvas quiz ID.
   * @param params - Optional includes.
   */
  listSubmissions(
    quizId: QuizId | number,
    params?: { include?: string[]; per_page?: number },
  ): Promise<{ quiz_submissions: QuizSubmission[]; submissions?: unknown[]; quizzes?: Quiz[] }> {
    return this.#http.get(
      `/courses/${this.#courseId}/quizzes/${quizId}/submissions`,
      params as Record<string, unknown>,
    );
  }

  /**
   * Returns the current user's submission for a quiz.
   *
   * @param quizId - Numeric Canvas quiz ID.
   */
  retrieveSubmission(quizId: QuizId | number): Promise<QuizSubmission> {
    return this.#http
      .get<{ quiz_submissions: QuizSubmission[] }>(
        `/courses/${this.#courseId}/quizzes/${quizId}/submission`,
      )
      .then((res) => {
        const sub = res.quiz_submissions[0];
        if (!sub)
          throw new CanvasNotFoundError(
            `/courses/${this.#courseId}/quizzes/${quizId}/submission`,
          );
        return sub;
      });
  }
}
