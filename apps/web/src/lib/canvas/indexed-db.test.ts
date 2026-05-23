import { beforeAll, beforeEach, describe, expect, test } from "bun:test";
import "fake-indexeddb/auto";

import { emptyDebugSnapshot } from "@canvas-v4/canvas-sync";

let clearCanvasSnapshot: typeof import("./indexed-db").clearCanvasSnapshot;
let loadMutationQueue: typeof import("./indexed-db").loadMutationQueue;
let loadCanvasSnapshot: typeof import("./indexed-db").loadCanvasSnapshot;
let persistMutationQueue: typeof import("./indexed-db").persistMutationQueue;
let persistCanvasSnapshot: typeof import("./indexed-db").persistCanvasSnapshot;

describe("canvas IndexedDB persistence", () => {
  beforeAll(async () => {
    const persistence = await import("./indexed-db");
    clearCanvasSnapshot = persistence.clearCanvasSnapshot;
    loadMutationQueue = persistence.loadMutationQueue;
    loadCanvasSnapshot = persistence.loadCanvasSnapshot;
    persistMutationQueue = persistence.persistMutationQueue;
    persistCanvasSnapshot = persistence.persistCanvasSnapshot;
  });

  beforeEach(async () => {
    await clearCanvasSnapshot("user-1");
    await clearCanvasSnapshot("user-2");
  });

  test("round-trips a debug snapshot", async () => {
    const snapshot = emptyDebugSnapshot();
    snapshot.courses.push({
      id: 1,
      name: "Biology",
      sync: {
        id: "course:1",
        canvasId: "1",
        fetchedAt: "2026-01-01T00:00:00.000Z",
        source: "canvas",
      },
    } as never);

    await persistCanvasSnapshot("user-1", snapshot);
    const loaded = await loadCanvasSnapshot("user-1");

    expect(loaded.courses).toHaveLength(1);
    expect(loaded.courses[0]?.sync.id).toBe("course:1");
  });

  test("partitions snapshots by owner id", async () => {
    const first = emptyDebugSnapshot();
    first.courses.push({
      id: 1,
      name: "Biology",
      sync: {
        id: "course:1",
        canvasId: "1",
        fetchedAt: "2026-01-01T00:00:00.000Z",
        source: "canvas",
      },
    } as never);

    await persistCanvasSnapshot("user-1", first);

    expect((await loadCanvasSnapshot("user-1")).courses).toHaveLength(1);
    expect((await loadCanvasSnapshot("user-2")).courses).toHaveLength(0);
  });

  test("partitions mutation queues by owner id", async () => {
    await persistMutationQueue("user-1", [
      {
        id: "mutation:1",
        ownerId: "user-1",
        namespace: "todos",
        operation: "todo.create",
        payload: { title: "one" },
        status: "queued",
        attempts: 0,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);

    expect(await loadMutationQueue("user-1")).toHaveLength(1);
    expect(await loadMutationQueue("user-2")).toHaveLength(0);
  });

  test("clears the cached snapshot", async () => {
    const snapshot = emptyDebugSnapshot();
    snapshot.syncErrors.push({
      id: "error:1",
      scope: "test",
      message: "boom",
      occurredAt: "2026-01-01T00:00:00.000Z",
    });

    await persistCanvasSnapshot("user-1", snapshot);
    const cleared = await clearCanvasSnapshot("user-1");
    const loaded = await loadCanvasSnapshot("user-1");

    expect(cleared.syncErrors).toHaveLength(0);
    expect(loaded.syncErrors).toHaveLength(0);
  });
});
