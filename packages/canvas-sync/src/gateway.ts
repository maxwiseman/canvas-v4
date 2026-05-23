import { CanvasAPIError, CanvasClient } from "@canvas-v4/canvas-sdk";

import type { CanvasSyncError, CanvasSyncPriority } from "./types";

export interface CanvasGatewayOptions {
  token: string;
  domain: string;
  userId?: string;
  fetch?: typeof globalThis.fetch;
  maxRetries?: number;
}

export interface CanvasGatewayRunOptions {
  key: string;
  priority: CanvasSyncPriority;
  scope: string;
}

type QueueTask<T> = {
  priority: CanvasSyncPriority;
  run: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
};

const priorityRank: Record<CanvasSyncPriority, number> = {
  visible: 0,
  background: 1,
  idle: 2,
};

export class CanvasGateway {
  readonly client: CanvasClient;
  readonly #inFlight = new Map<string, Promise<unknown>>();
  readonly #queue: QueueTask<unknown>[] = [];
  readonly #fetch: typeof globalThis.fetch;
  readonly #maxRetries: number;
  #active = false;
  lastBackoffUntil: number | undefined;

  constructor(options: CanvasGatewayOptions) {
    this.#fetch = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.#maxRetries = options.maxRetries ?? 2;
    this.client = new CanvasClient({
      token: options.token,
      domain: options.domain,
      fetch: this.#requestWithRetry,
    });
  }

  run<T>(options: CanvasGatewayRunOptions, operation: (client: CanvasClient) => Promise<T>): Promise<T> {
    const existing = this.#inFlight.get(options.key) as Promise<T> | undefined;
    if (existing) return existing;

    const promise = new Promise<T>((resolve, reject) => {
      this.#queue.push({
        priority: options.priority,
        run: () => operation(this.client),
        resolve: resolve as (value: unknown) => void,
        reject,
      });
      this.#drain();
    }).finally(() => {
      this.#inFlight.delete(options.key);
    });

    this.#inFlight.set(options.key, promise);
    return promise;
  }

  #drain(): void {
    if (this.#active) return;
    const next = [...this.#queue].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])[0];
    if (!next) return;

    const index = this.#queue.indexOf(next);
    this.#queue.splice(index, 1);
    this.#active = true;

    next
      .run()
      .then(next.resolve)
      .catch(next.reject)
      .finally(() => {
        this.#active = false;
        this.#drain();
      });
  }

  #requestWithRetry = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let attempt = 0;
    while (true) {
      const response = await this.#fetch(input, init);
      if (response.status !== 429 && response.status < 500) return response;
      if (attempt >= this.#maxRetries) return response;

      const retryAfterMs = parseRetryAfter(response.headers.get("retry-after")) ?? 750 * (attempt + 1);
      this.lastBackoffUntil = Date.now() + retryAfterMs;
      await sleep(retryAfterMs);
      attempt += 1;
    }
  };
}

export function canvasErrorFromUnknown(error: unknown, scope: string): CanvasSyncError {
  const occurredAt = new Date().toISOString();
  if (error instanceof CanvasAPIError) {
    return {
      id: `error:${scope}:${occurredAt}`,
      scope,
      message: error.message,
      status: error.status,
      retryAfterMs: error.status === 429 ? 1_000 : undefined,
      occurredAt,
    };
  }

  return {
    id: `error:${scope}:${occurredAt}`,
    scope,
    message: error instanceof Error ? error.message : String(error),
    occurredAt,
  };
}

export function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1_000);
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return undefined;
  return Math.max(0, timestamp - Date.now());
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createCanvasGateway(options: CanvasGatewayOptions): CanvasGateway {
  return new CanvasGateway(options);
}
