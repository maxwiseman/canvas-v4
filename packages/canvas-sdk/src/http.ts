/**
 * Low-level HTTP client used by all resource classes.
 *
 * Handles:
 * - Bearer-token authentication
 * - JSON serialisation / deserialisation
 * - Link-header pagination
 * - Error mapping to typed {@link CanvasAPIError} subclasses
 *
 * @module http
 */

import {
  CanvasNetworkError,
  type CanvasErrorBody,
  createAPIError,
} from "./errors";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** Configuration options for the HTTP client. */
export interface HttpClientOptions {
  /**
   * Canvas API access token.
   * Passed as `Authorization: Bearer <token>` on every request.
   */
  token: string;
  /**
   * Hostname of the Canvas instance, **without** a trailing slash and
   * **without** a scheme.
   *
   * @example "school.instructure.com"
   * @example "canvas.example.edu"
   */
  domain: string;
  /**
   * Maximum number of items to request per page when the caller does not
   * specify `per_page`. Defaults to `100`.
   */
  defaultPerPage?: number;
  /**
   * Optional fetch implementation. Defaults to the global `fetch`.
   * Useful for testing or environments that need a custom fetch.
   */
  fetch?: typeof globalThis.fetch;
}

/** A parsed page of results together with pagination metadata. */
export interface PageResult<T> {
  /** The items on this page. */
  data: T[];
  /** Whether there is at least one more page of results. */
  hasMore: boolean;
  /**
   * The URL of the next page, parsed from the `Link` response header.
   * `undefined` when {@link hasMore} is `false`.
   */
  nextUrl: string | undefined;
  /**
   * The URL of the first page, parsed from the `Link` response header.
   * May be `undefined` for single-page responses.
   */
  firstUrl: string | undefined;
  /**
   * The URL of the last page, parsed from the `Link` response header.
   * May be `undefined` for single-page responses.
   */
  lastUrl: string | undefined;
}

/** Options accepted by list-style endpoints. */
export interface ListParams {
  /** Number of results to return per page (Canvas maximum: 100). */
  per_page?: number;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// CanvasPagedList
// ---------------------------------------------------------------------------

/**
 * A lazy, paginated list of Canvas resources.
 *
 * Implements {@link AsyncIterable} so it can be used directly in `for await`
 * loops. Individual pages can also be fetched on demand via {@link nextPage}.
 *
 * **Single-use**: the pagination cursor is shared across all access patterns
 * (iteration, `.all()`, `.nextPage()`). To re-iterate from the start, call
 * the originating list method again to obtain a new `CanvasPagedList`.
 *
 * @typeParam T - The resource type contained in this list.
 *
 * @example Iterate over every item across all pages
 * ```ts
 * for await (const course of canvas.courses.list()) {
 *   console.log(course.name);
 * }
 * ```
 *
 * @example Collect all items into an array
 * ```ts
 * const courses = await canvas.courses.list().all();
 * ```
 *
 * @example Fetch only the first page
 * ```ts
 * const page = await canvas.courses.list().firstPage();
 * console.log(page.data, page.hasMore);
 * ```
 */
export class CanvasPagedList<T> implements AsyncIterable<T> {
  readonly #http: CanvasHttpClient;
  #nextUrl: string | undefined;
  #started = false;

  /** @internal */
  constructor(http: CanvasHttpClient, initialUrl: string) {
    this.#http = http;
    this.#nextUrl = initialUrl;
  }

  // -------------------------------------------------------------------------
  // AsyncIterable
  // -------------------------------------------------------------------------

  /**
   * Returns an `AsyncIterator` over every item across all pages.
   *
   * ⚠️ **Single-use cursor**: `CanvasPagedList` maintains a single pagination
   * cursor. If you iterate the same instance twice the second loop will yield
   * nothing (the cursor is already exhausted). To restart from the first page
   * call the originating list method again — e.g. `canvas.courses.list()` —
   * which always creates a fresh `CanvasPagedList`.
   */
  [Symbol.asyncIterator](): AsyncIterator<T> {
    const self = this;
    let buffer: T[] = [];
    let bufferIndex = 0;

    return {
      async next(): Promise<IteratorResult<T>> {
        // Drain the current buffer first
        if (bufferIndex < buffer.length) {
          // biome-ignore lint/style/noNonNullAssertion: index is in bounds
          return { value: buffer[bufferIndex++]!, done: false };
        }

        // Fetch the next page if available
        if (self.#nextUrl === undefined && self.#started) {
          return { value: undefined as unknown as T, done: true };
        }

        const page = await self.#fetchNext();
        buffer = page.data;
        bufferIndex = 0;

        if (buffer.length === 0) {
          return { value: undefined as unknown as T, done: true };
        }

        // biome-ignore lint/style/noNonNullAssertion: length checked above
        return { value: buffer[bufferIndex++]!, done: false };
      },
    };
  }

  // -------------------------------------------------------------------------
  // Convenience methods
  // -------------------------------------------------------------------------

  /**
   * Collects **all** items across every page into a single array.
   *
   * ⚠️ Use with care on large datasets — Canvas courses with thousands of
   * assignments will make many HTTP requests.
   */
  async all(): Promise<T[]> {
    const results: T[] = [];
    for await (const item of this) {
      results.push(item);
    }
    return results;
  }

  /**
   * Fetches the **first** page only, returning both the items and pagination
   * metadata.
   */
  async firstPage(): Promise<PageResult<T>> {
    return this.#fetchNext();
  }

  /**
   * Fetches the **next** page of results.
   * Returns a page with `hasMore: false` and an empty `data` array once all
   * pages have been exhausted.
   */
  async nextPage(): Promise<PageResult<T>> {
    return this.#fetchNext();
  }

  // -------------------------------------------------------------------------
  // Internals
  // -------------------------------------------------------------------------

  async #fetchNext(): Promise<PageResult<T>> {
    if (this.#nextUrl === undefined) {
      return { data: [], hasMore: false, nextUrl: undefined, firstUrl: undefined, lastUrl: undefined };
    }

    this.#started = true;
    const page = await this.#http.getPage<T>(this.#nextUrl);
    this.#nextUrl = page.nextUrl;
    return page;
  }
}

// ---------------------------------------------------------------------------
// CanvasHttpClient
// ---------------------------------------------------------------------------

/**
 * Low-level HTTP client used internally by all resource classes.
 * You should not need to use this directly — interact with the SDK through
 * {@link CanvasClient} instead.
 *
 * @internal
 */
export class CanvasHttpClient {
  readonly #token: string;
  readonly #baseUrl: string;
  readonly #defaultPerPage: number;
  readonly #fetch: typeof globalThis.fetch;

  constructor(options: HttpClientOptions) {
    this.#token = options.token;
    this.#baseUrl = `https://${options.domain}/api/v1`;
    this.#defaultPerPage = options.defaultPerPage ?? 100;
    this.#fetch = options.fetch ?? globalThis.fetch.bind(globalThis);
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Sends a GET request and returns the parsed JSON body.
   * For paginated endpoints prefer {@link getList} or {@link getPage}.
   */
  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const url = this.#buildUrl(path, params);
    const res = await this.#request("GET", url);
    return this.#parseJson<T>(res, url);
  }

  /**
   * Returns a {@link CanvasPagedList} for a paginated GET endpoint.
   */
  getList<T>(path: string, params?: ListParams): CanvasPagedList<T> {
    const merged = { per_page: this.#defaultPerPage, ...params };
    const url = this.#buildUrl(path, merged);
    return new CanvasPagedList<T>(this, url);
  }

  /**
   * Fetches a single page from an absolute URL.
   * Used internally by {@link CanvasPagedList}.
   *
   * @internal
   */
  async getPage<T>(absoluteUrl: string): Promise<PageResult<T>> {
    const res = await this.#request("GET", absoluteUrl);
    const data = await this.#parseJson<T[]>(res, absoluteUrl);
    const links = parseLinkHeader(res.headers.get("link") ?? "");
    return {
      data,
      hasMore: "next" in links,
      nextUrl: links["next"],
      firstUrl: links["first"],
      lastUrl: links["last"],
    };
  }

  /**
   * Sends a POST request with a JSON body and returns the parsed JSON response.
   */
  async post<T>(path: string, body?: unknown): Promise<T> {
    const url = this.#buildUrl(path);
    const res = await this.#request("POST", url, body);
    return this.#parseJson<T>(res, url);
  }

  /**
   * Sends a POST request with a `FormData` body and returns the parsed JSON
   * response. Used for multipart file uploads and form submissions.
   */
  async postForm<T>(path: string, form: FormData): Promise<T> {
    const url = this.#buildUrl(path);
    const res = await this.#requestRaw("POST", url, form);
    return this.#parseJson<T>(res, url);
  }

  /**
   * Sends a PUT request with a JSON body and returns the parsed JSON response.
   */
  async put<T>(path: string, body?: unknown): Promise<T> {
    const url = this.#buildUrl(path);
    const res = await this.#request("PUT", url, body);
    return this.#parseJson<T>(res, url);
  }

  /**
   * Sends a DELETE request and returns the parsed JSON response (if any).
   */
  async delete<T = void>(path: string): Promise<T> {
    const url = this.#buildUrl(path);
    const res = await this.#request("DELETE", url);
    if (res.status === 204 || res.headers.get("content-length") === "0") {
      return undefined as T;
    }
    return this.#parseJson<T>(res, url);
  }

  // -------------------------------------------------------------------------
  // Internals
  // -------------------------------------------------------------------------

  #buildUrl(path: string, params?: Record<string, unknown>): string {
    const base = path.startsWith("http") ? path : `${this.#baseUrl}${path}`;
    if (!params) return base;

    const qs = buildQueryString(params);
    return qs ? `${base}?${qs}` : base;
  }

  async #request(
    method: string,
    url: string,
    body?: unknown,
  ): Promise<Response> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.#token}`,
      Accept: "application/json",
    };

    let fetchBody: BodyInit | undefined;
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      fetchBody = JSON.stringify(body);
    }

    return this.#requestRaw(method, url, fetchBody, headers);
  }

  async #requestRaw(
    method: string,
    url: string,
    body?: BodyInit,
    extraHeaders?: Record<string, string>,
  ): Promise<Response> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.#token}`,
      Accept: "application/json",
      ...extraHeaders,
    };

    let res: Response;
    try {
      res = await this.#fetch(url, { method, headers, body });
    } catch (err) {
      throw new CanvasNetworkError(
        `Network error while connecting to Canvas: ${String(err)}`,
        err,
      );
    }

    if (!res.ok) {
      let errorBody: CanvasErrorBody | undefined;
      try {
        errorBody = (await res.json()) as CanvasErrorBody;
      } catch {
        // Ignore parse failures — we'll still throw with status code
      }
      throw createAPIError(res.status, url, errorBody);
    }

    return res;
  }

  async #parseJson<T>(res: Response, url: string): Promise<T> {
    try {
      return (await res.json()) as T;
    } catch (err) {
      throw new CanvasNetworkError(
        `Failed to parse JSON response from ${url}: ${String(err)}`,
        err,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Parses an HTTP `Link` header into a map of rel → URL.
 *
 * @example
 * ```
 * Link: <https://example.com/api?page=2>; rel="next", <...>; rel="last"
 * // → { next: "https://example.com/api?page=2", last: "..." }
 * ```
 */
function parseLinkHeader(header: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!header) return result;

  const parts = header.split(",");
  for (const part of parts) {
    const match = part.trim().match(/^<([^>]+)>;\s*rel="([^"]+)"/);
    if (match) {
      const url = match[1];
      const rel = match[2];
      if (url && rel) result[rel] = url;
    }
  }
  return result;
}

/**
 * Serialises a params object to a URL query string, correctly handling
 * Canvas array parameters (e.g. `include[]`).
 */
function buildQueryString(params: Record<string, unknown>): string {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        parts.push(
          `${encodeURIComponent(key)}[]=${encodeURIComponent(String(item))}`,
        );
      }
    } else {
      parts.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
      );
    }
  }

  return parts.join("&");
}
