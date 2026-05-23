import { describe, expect, test } from "bun:test";

import { createCanvasGateway, parseRetryAfter } from "../gateway";

describe("canvas gateway", () => {
  test("dedupes identical in-flight operations", async () => {
    const gateway = createCanvasGateway({
      domain: "canvas.example.edu",
      token: "token",
      fetch: async () => Response.json({ id: 1, name: "Max" }),
    });
    let calls = 0;

    const operation = () =>
      gateway.run({ key: "same", priority: "visible", scope: "test" }, async (canvas) => {
        calls += 1;
        return canvas.users.retrieve("self");
      });

    const [first, second] = await Promise.all([operation(), operation()]);

    expect(first).toEqual(second);
    expect(calls).toBe(1);
  });

  test("retries 429 responses before returning data", async () => {
    let attempts = 0;
    const gateway = createCanvasGateway({
      domain: "canvas.example.edu",
      token: "token",
      maxRetries: 1,
      fetch: async () => {
        attempts += 1;
        if (attempts === 1) {
          return new Response(JSON.stringify({ message: "rate limited" }), {
            status: 429,
            headers: { "retry-after": "0" },
          });
        }
        return Response.json({ id: 1, name: "Max" });
      },
    });

    const user = await gateway.run({ key: "retry", priority: "visible", scope: "test" }, (canvas) =>
      canvas.users.retrieve("self"),
    );

    expect(user.id).toBe(1);
    expect(attempts).toBe(2);
  });

  test("parses retry-after headers", () => {
    expect(parseRetryAfter("2")).toBe(2_000);
    expect(parseRetryAfter(null)).toBeUndefined();
  });
});
