import { describe, expect, test } from "bun:test";

import {
  createQueuedMutation,
  markMutationAcked,
  markMutationError,
  markMutationPushing,
} from "./mutation-queue";

describe("local mutation queue", () => {
  test("creates a queued mutation with stable metadata", () => {
    const mutation = createQueuedMutation({
      id: "mutation:test",
      namespace: "todos",
      operation: "todo.create",
      payload: { title: "Read chapter 1" },
    });

    expect(mutation.id).toBe("mutation:test");
    expect(mutation.status).toBe("queued");
    expect(mutation.attempts).toBe(0);
  });

  test("tracks pushing, acked, and error states", () => {
    const queued = createQueuedMutation({
      namespace: "ai",
      operation: "message.create",
      payload: { text: "hi" },
    });
    const pushing = markMutationPushing(queued);
    const errored = markMutationError(pushing, new Error("offline"));
    const acked = markMutationAcked(errored);

    expect(pushing.status).toBe("pushing");
    expect(pushing.attempts).toBe(1);
    expect(errored.status).toBe("error");
    expect(errored.error).toBe("offline");
    expect(acked.status).toBe("acked");
    expect(acked.error).toBeUndefined();
  });
});
