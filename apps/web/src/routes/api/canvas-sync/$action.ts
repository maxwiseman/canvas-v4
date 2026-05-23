import {
  getCanvasBootstrapEnvelope,
  missingCanvasConfigEnvelope,
  syncAssignmentDetailEnvelope,
  syncCanvasDashboardEnvelope,
  syncCourseAnnouncementsEnvelope,
  syncCourseBasicsEnvelope,
  syncCourseModulesEnvelope,
} from "@canvas-v4/canvas-sync";
import { auth } from "@canvas-v4/auth";
import { env } from "@canvas-v4/env/server";
import { createFileRoute } from "@tanstack/react-router";

import { getCanvasSettings } from "@/lib/server/canvas-settings";
import { decryptSecret } from "@/lib/server/encryption";

export const Route = createFileRoute("/api/canvas-sync/$action")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return json({ error: "Unauthorized" }, 401);

        const options = await getCanvasOptions(session.user.id);
        if (!options) return json(missingCanvasConfigEnvelope(params.action));

        if (params.action === "bootstrap") {
          return json(await getCanvasBootstrapEnvelope(options));
        }
        if (params.action === "dashboard") {
          return json(await syncCanvasDashboardEnvelope(options));
        }

        return json({ error: `Unknown Canvas sync action: ${params.action}` }, 404);
      },
      POST: async ({ params, request }) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return json({ error: "Unauthorized" }, 401);

        const options = await getCanvasOptions(session.user.id);
        const body = await request.json().catch(() => ({}));
        const courseId = readString(body, "courseId");
        const assignmentId = readString(body, "assignmentId");

        if (!options) return json(missingCanvasConfigEnvelope(getPostScope(params.action, courseId, assignmentId)));

        if (params.action === "course") {
          if (!courseId) return json({ error: "courseId is required" }, 400);
          return json(await syncCourseBasicsEnvelope(options, courseId));
        }
        if (params.action === "modules") {
          if (!courseId) return json({ error: "courseId is required" }, 400);
          return json(await syncCourseModulesEnvelope(options, courseId));
        }
        if (params.action === "announcements") {
          if (!courseId) return json({ error: "courseId is required" }, 400);
          return json(await syncCourseAnnouncementsEnvelope(options, courseId));
        }
        if (params.action === "assignment") {
          if (!courseId || !assignmentId) return json({ error: "courseId and assignmentId are required" }, 400);
          return json(await syncAssignmentDetailEnvelope(options, courseId, assignmentId));
        }

        return json({ error: `Unknown Canvas sync action: ${params.action}` }, 404);
      },
    },
  },
});

async function getCanvasOptions(userId: string) {
  const settings = await getCanvasSettings(userId);
  if (settings?.domain && settings.accessToken) {
    return {
      domain: settings.domain,
      token: decryptSecret(settings.accessToken),
      userId,
    };
  }

  if (!env.CANVAS_DOMAIN || !env.CANVAS_ACCESS_TOKEN) return undefined;
  return {
    domain: env.CANVAS_DOMAIN,
    token: env.CANVAS_ACCESS_TOKEN,
    userId,
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

function getPostScope(action: string, courseId: string | undefined, assignmentId: string | undefined): string {
  if (action === "course" && courseId) return `course:${courseId}`;
  if (action === "modules" && courseId) return `modules:${courseId}`;
  if (action === "announcements" && courseId) return `announcements:${courseId}`;
  if (action === "assignment" && courseId && assignmentId) return `assignment:${courseId}:${assignmentId}`;
  return action;
}

function readString(value: unknown, key: string): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = (value as Record<string, unknown>)[key];
  if (typeof raw === "string" && raw.length > 0) return raw;
  if (typeof raw === "number") return String(raw);
  return undefined;
}
