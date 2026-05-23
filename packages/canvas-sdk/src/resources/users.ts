/**
 * Resource class for the Canvas Users API.
 *
 * @module resources/users
 */

import type { CanvasHttpClient, CanvasPagedList } from "../http";
import type {
  ActivityStreamItem,
  GetUserParams,
  ListUsersParams,
  TodoItem,
  User,
  UserId,
  UserProfile,
} from "../types/index";

/**
 * Provides access to Canvas user resources.
 *
 * Obtain an instance via `canvas.users`.
 *
 * @example
 * ```ts
 * // Get the current user's profile
 * const me = await canvas.users.retrieveSelf();
 * console.log(me.name, me.primary_email);
 *
 * // Get the current user's to-do list
 * const todos = await canvas.users.todoItems();
 * ```
 */
export class UsersResource {
  readonly #http: CanvasHttpClient;

  /** @internal */
  constructor(http: CanvasHttpClient) {
    this.#http = http;
  }

  // ---------------------------------------------------------------------------
  // Core CRUD
  // ---------------------------------------------------------------------------

  /**
   * Returns a paginated list of users in an account.
   * Requires admin privileges.
   *
   * @param accountId - Numeric Canvas account ID.
   * @param params - Optional filters.
   */
  list(accountId: number, params?: ListUsersParams): CanvasPagedList<User> {
    return this.#http.getList<User>(
      `/accounts/${accountId}/users`,
      params as Record<string, unknown>,
    );
  }

  /**
   * Returns a single user by ID.
   *
   * @param userId - Numeric Canvas user ID, or `"self"` for the current user.
   * @param params - Optional includes.
   *
   * @example
   * ```ts
   * const user = await canvas.users.retrieve("self");
   * ```
   */
  retrieve(userId: UserId | number | "self", params?: GetUserParams): Promise<User> {
    return this.#http.get<User>(
      `/users/${userId}`,
      params as Record<string, unknown>,
    );
  }

  /**
   * Returns the current user's full profile.
   *
   * @example
   * ```ts
   * const profile = await canvas.users.retrieveSelf();
   * console.log(profile.primary_email, profile.bio);
   * ```
   */
  retrieveSelf(): Promise<UserProfile> {
    return this.#http.get<UserProfile>("/users/self/profile");
  }

  // ---------------------------------------------------------------------------
  // Activity / To-do
  // ---------------------------------------------------------------------------

  /**
   * Returns the current user's activity stream (recent Canvas activity).
   *
   * @example
   * ```ts
   * const stream = await canvas.users.activityStream().all();
   * ```
   */
  activityStream(): CanvasPagedList<ActivityStreamItem> {
    return this.#http.getList<ActivityStreamItem>("/users/self/activity_stream");
  }

  /**
   * Returns the current user's to-do items (assignments to submit / grade).
   *
   * @param params - Optional filters.
   *
   * @example
   * ```ts
   * const todos = await canvas.users.todoItems();
   * for (const item of todos) {
   *   console.log(item.type, item.assignment.name, item.assignment.due_at);
   * }
   * ```
   */
  async todoItems(params?: { per_page?: number }): Promise<TodoItem[]> {
    return this.#http.get<TodoItem[]>("/users/self/todo", params as Record<string, unknown>);
  }

  /**
   * Returns the count of items in the current user's to-do list.
   */
  todoItemCount(): Promise<{ needs_grading_count: number; assignments_needing_submitting: number }> {
    return this.#http.get("/users/self/todo_item_count");
  }

  /**
   * Returns upcoming events/assignments for the current user.
   */
  upcomingEvents(): CanvasPagedList<unknown> {
    return this.#http.getList("/users/self/upcoming_events");
  }

  // ---------------------------------------------------------------------------
  // Missing submissions
  // ---------------------------------------------------------------------------

  /**
   * Returns all missing submissions for the current user (or a specified user,
   * for observers / instructors).
   *
   * @param userId - Canvas user ID or `"self"`.
   * @param params - Optional filters.
   */
  missingSubmissions(
    userId: UserId | number | "self" = "self",
    params?: {
      include?: string[];
      filter?: string[];
      course_ids?: number[];
      per_page?: number;
    },
  ): CanvasPagedList<unknown> {
    return this.#http.getList(
      `/users/${userId}/missing_submissions`,
      params as Record<string, unknown>,
    );
  }
}
