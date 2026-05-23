import { auth } from "@canvas-v4/auth";
import { db } from "@canvas-v4/db";
import { canvasAccountSettings } from "@canvas-v4/db/schema";
import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";

import { getCanvasSettings } from "@/lib/server/canvas-settings";
import { encryptSecret } from "@/lib/server/encryption";

export const Route = createFileRoute("/api/canvas-settings")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return json({ error: "Unauthorized" }, 401);

        const settings = await getCanvasSettings(session.user.id);
        return json(toPublicSettings(settings));
      },
      PUT: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return json({ error: "Unauthorized" }, 401);

        const body = await request.json().catch(() => ({}));
        const domain = normalizeDomain(readString(body, "domain"));
        const accessToken = readString(body, "accessToken");
        const existing = await getCanvasSettings(session.user.id);
        const nextToken = accessToken ? encryptSecret(accessToken) : existing?.accessToken;

        if (!domain) return json({ error: "Canvas domain is required." }, 400);
        if (!nextToken) return json({ error: "Canvas access token is required." }, 400);

        const now = new Date();
        const [settings] = await db
          .insert(canvasAccountSettings)
          .values({
            id: existing?.id ?? `canvas-settings:${session.user.id}`,
            userId: session.user.id,
            domain,
            accessToken: nextToken,
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: canvasAccountSettings.userId,
            set: {
              domain,
              accessToken: nextToken,
              updatedAt: now,
            },
          })
          .returning();

        return json(toPublicSettings(settings));
      },
      DELETE: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return json({ error: "Unauthorized" }, 401);

        await db.delete(canvasAccountSettings).where(eq(canvasAccountSettings.userId, session.user.id));
        return json({ domain: "", hasAccessToken: false, updatedAt: null });
      },
    },
  },
});

function toPublicSettings(settings: Awaited<ReturnType<typeof getCanvasSettings>>) {
  return {
    domain: settings?.domain ?? "",
    hasAccessToken: Boolean(settings?.accessToken),
    updatedAt: settings?.updatedAt?.toISOString() ?? null,
  };
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}

function readString(value: unknown, key: string): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = (value as Record<string, unknown>)[key];
  if (typeof raw === "string" && raw.trim().length > 0) return raw.trim();
  return undefined;
}

function normalizeDomain(domain: string | undefined): string | undefined {
  if (!domain) return undefined;
  return domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}
