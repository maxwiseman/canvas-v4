/**
 * Error classes for the Canvas LMS SDK.
 *
 * @module errors
 */

/** A single error object returned in a Canvas API error response. */
export interface CanvasErrorObject {
  /** Human-readable error message. */
  message: string;
  /** Machine-readable error code, if provided. */
  error_code?: string | undefined;
}

/** The raw error body returned by the Canvas API. */
export interface CanvasErrorBody {
  message?: string | undefined;
  errors?: CanvasErrorObject[] | undefined;
  /** An error report ID that can be provided to Canvas support. */
  error_report_id?: number | undefined;
  /** Status text for some 401 responses. */
  status?: string | undefined;
}

/**
 * Base class for all Canvas SDK errors.
 */
export class CanvasError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CanvasError";
  }
}

/**
 * Thrown when the Canvas API returns a non-2xx HTTP response.
 *
 * @example
 * ```ts
 * try {
 *   await canvas.courses.retrieve(999999);
 * } catch (err) {
 *   if (err instanceof CanvasAPIError && err.status === 404) {
 *     console.log("Course not found");
 *   }
 * }
 * ```
 */
export class CanvasAPIError extends CanvasError {
  /** HTTP status code of the response. */
  readonly status: number;
  /** Parsed error body from the Canvas API, if available. */
  readonly body: CanvasErrorBody | undefined;
  /** The URL that was requested. */
  readonly url: string;

  constructor(status: number, url: string, body?: CanvasErrorBody) {
    const message = deriveMessage(status, url, body);
    super(message);
    this.name = "CanvasAPIError";
    this.status = status;
    this.url = url;
    this.body = body;
  }
}

/**
 * Thrown when the request is rejected due to invalid credentials or an expired token.
 * HTTP 401.
 */
export class CanvasAuthenticationError extends CanvasAPIError {
  constructor(url: string, body?: CanvasErrorBody) {
    super(401, url, body);
    this.name = "CanvasAuthenticationError";
  }
}

/**
 * Thrown when the authenticated user does not have permission to perform the
 * requested action. HTTP 403.
 */
export class CanvasPermissionError extends CanvasAPIError {
  constructor(url: string, body?: CanvasErrorBody) {
    super(403, url, body);
    this.name = "CanvasPermissionError";
  }
}

/**
 * Thrown when the requested resource does not exist. HTTP 404.
 */
export class CanvasNotFoundError extends CanvasAPIError {
  constructor(url: string, body?: CanvasErrorBody) {
    super(404, url, body);
    this.name = "CanvasNotFoundError";
  }
}

/**
 * Thrown when the request conflicts with the current state of the resource.
 * HTTP 409.
 */
export class CanvasConflictError extends CanvasAPIError {
  constructor(url: string, body?: CanvasErrorBody) {
    super(409, url, body);
    this.name = "CanvasConflictError";
  }
}

/**
 * Thrown when the Canvas API rate-limits the request. HTTP 429.
 */
export class CanvasRateLimitError extends CanvasAPIError {
  constructor(url: string, body?: CanvasErrorBody) {
    super(429, url, body);
    this.name = "CanvasRateLimitError";
  }
}

/**
 * Thrown when the Canvas API returns a 5xx error.
 */
export class CanvasServerError extends CanvasAPIError {
  constructor(status: number, url: string, body?: CanvasErrorBody) {
    super(status, url, body);
    this.name = "CanvasServerError";
  }
}

/**
 * Thrown when a network-level failure occurs (e.g. DNS error, connection refused).
 */
export class CanvasNetworkError extends CanvasError {
  /** The underlying cause. */
  readonly cause: unknown;

  constructor(message: string, cause: unknown) {
    super(message);
    this.name = "CanvasNetworkError";
    this.cause = cause;
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function deriveMessage(
  status: number,
  url: string,
  body: CanvasErrorBody | undefined,
): string {
  const bodyMessage =
    body?.errors?.[0]?.message ?? body?.message ?? body?.status;
  if (bodyMessage) return `Canvas API error ${status}: ${bodyMessage} (${url})`;
  return `Canvas API error ${status} (${url})`;
}

/**
 * Constructs the appropriate {@link CanvasAPIError} subclass for a given HTTP
 * status code.
 *
 * @internal
 */
export function createAPIError(
  status: number,
  url: string,
  body?: CanvasErrorBody,
): CanvasAPIError {
  switch (status) {
    case 401:
      return new CanvasAuthenticationError(url, body);
    case 403:
      return new CanvasPermissionError(url, body);
    case 404:
      return new CanvasNotFoundError(url, body);
    case 409:
      return new CanvasConflictError(url, body);
    case 429:
      return new CanvasRateLimitError(url, body);
    default:
      if (status >= 500) return new CanvasServerError(status, url, body);
      return new CanvasAPIError(status, url, body);
  }
}
