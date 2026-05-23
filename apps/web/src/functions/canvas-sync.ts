import {
  getCanvasBootstrapEnvelope,
  missingCanvasConfigEnvelope,
  syncAssignmentDetailEnvelope,
  syncCanvasDashboardEnvelope,
  syncCourseBasicsEnvelope,
  syncCourseModulesEnvelope,
} from "@canvas-v4/canvas-sync";
import { env } from "@canvas-v4/env/server";
import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/middleware/auth";

type SerializableEnvelope = ReturnType<typeof JSON.parse>;

function getCanvasOptions(userId?: string) {
  if (!env.CANVAS_DOMAIN || !env.CANVAS_ACCESS_TOKEN) return undefined;
  return {
    domain: env.CANVAS_DOMAIN,
    token: env.CANVAS_ACCESS_TOKEN,
    userId,
  };
}

function asSerializable(envelope: unknown): SerializableEnvelope {
  return JSON.parse(JSON.stringify(envelope)) as SerializableEnvelope;
}

export const getCanvasBootstrap = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const options = getCanvasOptions(context.session?.user.id);
    if (!options) return asSerializable(missingCanvasConfigEnvelope("bootstrap"));
    return asSerializable(await getCanvasBootstrapEnvelope(options));
  });

export const syncCanvasDashboard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const options = getCanvasOptions(context.session?.user.id);
    if (!options) return asSerializable(missingCanvasConfigEnvelope("dashboard"));
    return asSerializable(await syncCanvasDashboardEnvelope(options));
  });

export const syncCourseBasics = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!data || typeof data !== "object" || !("courseId" in data)) {
      throw new Error("courseId is required");
    }
    return { courseId: String(data.courseId) };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const options = getCanvasOptions(context.session?.user.id);
    if (!options) return asSerializable(missingCanvasConfigEnvelope(`course:${data.courseId}`));
    return asSerializable(await syncCourseBasicsEnvelope(options, data.courseId));
  });

export const syncCourseModules = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!data || typeof data !== "object" || !("courseId" in data)) {
      throw new Error("courseId is required");
    }
    return { courseId: String(data.courseId) };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const options = getCanvasOptions(context.session?.user.id);
    if (!options) return asSerializable(missingCanvasConfigEnvelope(`modules:${data.courseId}`));
    return asSerializable(await syncCourseModulesEnvelope(options, data.courseId));
  });

export const syncAssignmentDetail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!data || typeof data !== "object" || !("courseId" in data) || !("assignmentId" in data)) {
      throw new Error("courseId and assignmentId are required");
    }
    return {
      courseId: String(data.courseId),
      assignmentId: String(data.assignmentId),
    };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const options = getCanvasOptions(context.session?.user.id);
    if (!options) return asSerializable(missingCanvasConfigEnvelope(`assignment:${data.courseId}:${data.assignmentId}`));
    return asSerializable(await syncAssignmentDetailEnvelope(options, data.courseId, data.assignmentId));
  });
