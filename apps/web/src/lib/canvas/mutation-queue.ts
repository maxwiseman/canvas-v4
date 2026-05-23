export type LocalMutationNamespace = "canvas" | "ai" | "todos";

export type LocalMutationStatus = "queued" | "pushing" | "acked" | "error";

export interface LocalMutation<TPayload = unknown> {
  id: string;
  ownerId?: string;
  namespace: LocalMutationNamespace;
  operation: string;
  payload: TPayload;
  status: LocalMutationStatus;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface QueueMutationInput<TPayload = unknown> {
  namespace: LocalMutationNamespace;
  operation: string;
  payload: TPayload;
  id?: string;
}

export function createQueuedMutation<TPayload>(input: QueueMutationInput<TPayload>): LocalMutation<TPayload> {
  const now = new Date().toISOString();
  return {
    id: input.id ?? `mutation:${input.namespace}:${input.operation}:${crypto.randomUUID()}`,
    namespace: input.namespace,
    operation: input.operation,
    payload: input.payload,
    status: "queued",
    attempts: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function markMutationPushing(mutation: LocalMutation): LocalMutation {
  return {
    ...mutation,
    status: "pushing",
    attempts: mutation.attempts + 1,
    updatedAt: new Date().toISOString(),
  };
}

export function markMutationAcked(mutation: LocalMutation): LocalMutation {
  return {
    ...mutation,
    status: "acked",
    updatedAt: new Date().toISOString(),
    error: undefined,
  };
}

export function markMutationError(mutation: LocalMutation, error: unknown): LocalMutation {
  return {
    ...mutation,
    status: "error",
    updatedAt: new Date().toISOString(),
    error: error instanceof Error ? error.message : String(error),
  };
}
