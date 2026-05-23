import { describe, expect, test } from "bun:test";

import { emptyDebugSnapshot, isScopeStale, mergeEnvelope, upsertBySyncId } from "../merge";
import { normalizeAssignment, normalizeCourse } from "../normalize";

describe("canvas sync merge helpers", () => {
  test("upserts entities by normalized sync id", () => {
    const first = normalizeCourse({ id: 1, name: "Biology" } as never, "2026-01-01T00:00:00.000Z");
    const second = normalizeCourse({ id: 1, name: "Advanced Biology" } as never, "2026-01-02T00:00:00.000Z");

    const result = upsertBySyncId([first], [second]);

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Advanced Biology");
    expect(result[0]?.sync.fetchedAt).toBe("2026-01-02T00:00:00.000Z");
  });

  test("merges envelopes into the debug snapshot and updates manifest", () => {
    const snapshot = emptyDebugSnapshot();
    const fetchedAt = "2026-01-01T00:00:00.000Z";

    const result = mergeEnvelope(snapshot, {
      courses: [normalizeCourse({ id: 2, name: "History" } as never, fetchedAt)],
      assignments: [normalizeAssignment({ id: 3, name: "Essay" } as never, fetchedAt, 2)],
      syncMeta: {
        scope: "dashboard",
        fetchedAt,
        source: "canvas",
      },
    });

    expect(result.courses).toHaveLength(1);
    expect(result.assignments).toHaveLength(1);
    expect(result.syncManifest[0]?.hydratedScopes.dashboard?.fetchedAt).toBe(fetchedAt);
  });

  test("detects stale sync stamps", () => {
    expect(isScopeStale(undefined, 1_000, 1_000)).toBe(true);
    expect(isScopeStale({ fetchedAt: "1970-01-01T00:00:00.500Z" }, 1_000, 1_000)).toBe(false);
    expect(isScopeStale({ fetchedAt: "1970-01-01T00:00:00.000Z" }, 500, 1_000)).toBe(true);
  });
});
