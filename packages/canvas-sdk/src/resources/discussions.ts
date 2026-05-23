/**
 * Resource class for the Canvas Discussion Topics API.
 *
 * @module resources/discussions
 */

import type { CanvasHttpClient, CanvasPagedList } from "../http";
import type {
  CourseId,
  CreateDiscussionEntryParams,
  CreateDiscussionTopicParams,
  DiscussionEntry,
  DiscussionTopic,
  DiscussionTopicId,
  DiscussionView,
  ListDiscussionTopicsParams,
} from "../types/index";

/**
 * Provides access to discussion topics within a course.
 *
 * Obtain an instance via `canvas.courses.discussions(courseId)`.
 *
 * @example
 * ```ts
 * const discussions = canvas.courses.discussions(12345);
 *
 * // List all discussions
 * for await (const d of discussions.list()) {
 *   console.log(d.title, d.discussion_subentry_count, "replies");
 * }
 *
 * // Get a discussion with its entries
 * const topic = await discussions.retrieve(topicId);
 * const view = await discussions.retrieveView(topicId);
 * ```
 */
export class DiscussionsResource {
  readonly #http: CanvasHttpClient;
  readonly #courseId: CourseId | number;

  /** @internal */
  constructor(http: CanvasHttpClient, courseId: CourseId | number) {
    this.#http = http;
    this.#courseId = courseId;
  }

  // ---------------------------------------------------------------------------
  // Topics
  // ---------------------------------------------------------------------------

  /**
   * Returns a paginated list of discussion topics for the course.
   *
   * @param params - Optional filters and includes.
   *
   * @example
   * ```ts
   * const pinned = await discussions.list({ scope: "pinned" }).all();
   * ```
   */
  list(params?: ListDiscussionTopicsParams): CanvasPagedList<DiscussionTopic> {
    return this.#http.getList<DiscussionTopic>(
      `/courses/${this.#courseId}/discussion_topics`,
      params as Record<string, unknown>,
    );
  }

  /**
   * Returns a single discussion topic by ID.
   *
   * @param topicId - Numeric Canvas discussion topic ID.
   */
  retrieve(topicId: DiscussionTopicId | number): Promise<DiscussionTopic> {
    return this.#http.get<DiscussionTopic>(
      `/courses/${this.#courseId}/discussion_topics/${topicId}`,
    );
  }

  /**
   * Returns the full threaded view of a discussion.
   *
   * The view includes all participants and a nested tree of {@link DiscussionEntry}
   * objects.
   *
   * @param topicId - Numeric Canvas discussion topic ID.
   *
   * @example
   * ```ts
   * const view = await discussions.retrieveView(topicId);
   * for (const entry of view.view) {
   *   console.log(entry.message, entry.replies?.length, "replies");
   * }
   * ```
   */
  retrieveView(topicId: DiscussionTopicId | number): Promise<DiscussionView> {
    return this.#http.get<DiscussionView>(
      `/courses/${this.#courseId}/discussion_topics/${topicId}/view`,
    );
  }

  /**
   * Creates a new discussion topic.
   *
   * @param params - Topic creation parameters.
   *
   * @example
   * ```ts
   * const topic = await discussions.create({
   *   title: "Week 1 Discussion",
   *   message: "<p>Introduce yourself!</p>",
   *   published: true,
   * });
   * ```
   */
  create(params: CreateDiscussionTopicParams): Promise<DiscussionTopic> {
    return this.#http.post<DiscussionTopic>(
      `/courses/${this.#courseId}/discussion_topics`,
      params,
    );
  }

  /**
   * Updates a discussion topic.
   *
   * @param topicId - Numeric Canvas discussion topic ID.
   * @param params - Fields to update.
   */
  update(
    topicId: DiscussionTopicId | number,
    params: Partial<CreateDiscussionTopicParams>,
  ): Promise<DiscussionTopic> {
    return this.#http.put<DiscussionTopic>(
      `/courses/${this.#courseId}/discussion_topics/${topicId}`,
      params,
    );
  }

  /**
   * Deletes a discussion topic.
   *
   * @param topicId - Numeric Canvas discussion topic ID.
   */
  delete(topicId: DiscussionTopicId | number): Promise<void> {
    return this.#http.delete<void>(
      `/courses/${this.#courseId}/discussion_topics/${topicId}`,
    );
  }

  // ---------------------------------------------------------------------------
  // Entries
  // ---------------------------------------------------------------------------

  /**
   * Returns top-level entries for a discussion topic.
   *
   * @param topicId - Numeric Canvas discussion topic ID.
   */
  listEntries(topicId: DiscussionTopicId | number): CanvasPagedList<DiscussionEntry> {
    return this.#http.getList<DiscussionEntry>(
      `/courses/${this.#courseId}/discussion_topics/${topicId}/entries`,
    );
  }

  /**
   * Posts a top-level reply to a discussion topic.
   *
   * @param topicId - Numeric Canvas discussion topic ID.
   * @param params - Entry content.
   *
   * @example
   * ```ts
   * await discussions.createEntry(topicId, {
   *   message: "<p>Hello everyone!</p>",
   * });
   * ```
   */
  createEntry(
    topicId: DiscussionTopicId | number,
    params: CreateDiscussionEntryParams,
  ): Promise<DiscussionEntry> {
    return this.#http.post<DiscussionEntry>(
      `/courses/${this.#courseId}/discussion_topics/${topicId}/entries`,
      params,
    );
  }

  /**
   * Posts a reply to an existing entry.
   *
   * @param topicId - Numeric Canvas discussion topic ID.
   * @param entryId - Numeric Canvas discussion entry ID.
   * @param params - Reply content.
   */
  createReply(
    topicId: DiscussionTopicId | number,
    entryId: number,
    params: CreateDiscussionEntryParams,
  ): Promise<DiscussionEntry> {
    return this.#http.post<DiscussionEntry>(
      `/courses/${this.#courseId}/discussion_topics/${topicId}/entries/${entryId}/replies`,
      params,
    );
  }

  /**
   * Marks a discussion topic as read for the current user.
   *
   * @param topicId - Numeric Canvas discussion topic ID.
   */
  markAsRead(topicId: DiscussionTopicId | number): Promise<void> {
    return this.#http.put<void>(
      `/courses/${this.#courseId}/discussion_topics/${topicId}/read`,
    );
  }

  /**
   * Subscribes the current user to a discussion topic.
   *
   * @param topicId - Numeric Canvas discussion topic ID.
   */
  subscribe(topicId: DiscussionTopicId | number): Promise<void> {
    return this.#http.put<void>(
      `/courses/${this.#courseId}/discussion_topics/${topicId}/subscribed`,
    );
  }

  /**
   * Unsubscribes the current user from a discussion topic.
   *
   * @param topicId - Numeric Canvas discussion topic ID.
   */
  unsubscribe(topicId: DiscussionTopicId | number): Promise<void> {
    return this.#http.delete<void>(
      `/courses/${this.#courseId}/discussion_topics/${topicId}/subscribed`,
    );
  }
}
