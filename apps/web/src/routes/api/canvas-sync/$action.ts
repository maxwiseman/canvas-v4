import { auth } from "@canvas-v4/auth";
import { CanvasClient } from "@canvas-v4/canvas-sdk";
import {
	type CanvasEnvelope,
	getCanvasBootstrapEnvelope,
	missingCanvasConfigEnvelope,
	normalizeCourse,
	syncAssignmentDetailEnvelope,
	syncCanvasDashboardEnvelope,
	syncCourseAnnouncementsEnvelope,
	syncCourseBasicsEnvelope,
	syncCourseModulesEnvelope,
} from "@canvas-v4/canvas-sync";
import { env } from "@canvas-v4/env/server";
import { createFileRoute } from "@tanstack/react-router";

import { getCanvasSettings } from "@/lib/server/canvas-settings";
import {
	getCourseOverlays,
	upsertCourseIcon,
} from "@/lib/server/course-overlays";
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
					return json(
						await withCourseOverlays(
							session.user.id,
							await getCanvasBootstrapEnvelope(options),
						),
					);
				}
				if (params.action === "dashboard") {
					return json(
						await withCourseOverlays(
							session.user.id,
							await syncCanvasDashboardEnvelope(options),
						),
					);
				}

				return json(
					{ error: `Unknown Canvas sync action: ${params.action}` },
					404,
				);
			},
			POST: async ({ params, request }) => {
				const session = await auth.api.getSession({ headers: request.headers });
				if (!session) return json({ error: "Unauthorized" }, 401);

				const options = await getCanvasOptions(session.user.id);
				const body = await request.json().catch(() => ({}));
				const courseId = readString(body, "courseId");
				const assignmentId = readString(body, "assignmentId");
				const icon = readNullableString(body, "icon");
				const nickname = readNullableString(body, "nickname");

				if (params.action === "course-icon") {
					if (!courseId) return json({ error: "courseId is required" }, 400);
					const overlay = await upsertCourseIcon(
						session.user.id,
						courseId,
						icon,
					);
					return json({
						courseOverlays: [overlay],
						syncMeta: {
							scope: `course-icon:${courseId}`,
							fetchedAt: overlay.updatedAt,
							source: "app",
						},
					} satisfies CanvasEnvelope);
				}

				if (!options)
					return json(
						missingCanvasConfigEnvelope(
							getPostScope(params.action, courseId, assignmentId),
						),
					);

				if (params.action === "course") {
					if (!courseId) return json({ error: "courseId is required" }, 400);
					return json(
						await withCourseOverlays(
							session.user.id,
							await syncCourseBasicsEnvelope(options, courseId),
						),
					);
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
					if (!courseId || !assignmentId)
						return json(
							{ error: "courseId and assignmentId are required" },
							400,
						);
					return json(
						await syncAssignmentDetailEnvelope(options, courseId, assignmentId),
					);
				}
				if (params.action === "course-nickname") {
					if (!courseId) return json({ error: "courseId is required" }, 400);
					if (typeof nickname === "string" && nickname.trim().length >= 60) {
						return json(
							{ error: "Nickname must be shorter than 60 characters." },
							400,
						);
					}
					return json(
						await updateCourseNicknameEnvelope(
							session.user.id,
							options,
							courseId,
							nickname,
						),
					);
				}

				return json(
					{ error: `Unknown Canvas sync action: ${params.action}` },
					404,
				);
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

function getPostScope(
	action: string,
	courseId: string | undefined,
	assignmentId: string | undefined,
): string {
	if (action === "course" && courseId) return `course:${courseId}`;
	if (action === "course-icon" && courseId) return `course-icon:${courseId}`;
	if (action === "course-nickname" && courseId)
		return `course-nickname:${courseId}`;
	if (action === "modules" && courseId) return `modules:${courseId}`;
	if (action === "announcements" && courseId)
		return `announcements:${courseId}`;
	if (action === "assignment" && courseId && assignmentId)
		return `assignment:${courseId}:${assignmentId}`;
	return action;
}

function readString(value: unknown, key: string): string | undefined {
	if (!value || typeof value !== "object") return undefined;
	const raw = (value as Record<string, unknown>)[key];
	if (typeof raw === "string" && raw.length > 0) return raw;
	if (typeof raw === "number") return String(raw);
	return undefined;
}

function readNullableString(
	value: unknown,
	key: string,
): string | null | undefined {
	if (!value || typeof value !== "object") return undefined;
	const raw = (value as Record<string, unknown>)[key];
	if (raw === null) return null;
	if (typeof raw === "string") return raw;
	if (typeof raw === "number") return String(raw);
	return undefined;
}

async function withCourseOverlays(
	userId: string,
	envelope: CanvasEnvelope,
): Promise<CanvasEnvelope> {
	const courseIds =
		envelope.courses?.map((course) => course.sync.canvasId) ?? [];
	if (courseIds.length === 0) return envelope;
	return {
		...envelope,
		courseOverlays: await getCourseOverlays(userId, courseIds),
	};
}

async function updateCourseNicknameEnvelope(
	userId: string,
	options: NonNullable<Awaited<ReturnType<typeof getCanvasOptions>>>,
	courseId: string,
	nickname: string | null | undefined,
): Promise<CanvasEnvelope> {
	const canvas = new CanvasClient(options);
	const fetchedAt = new Date().toISOString();
	const normalizedNickname = normalizeNickname(nickname);

	if (normalizedNickname) {
		await canvas.users.setCourseNickname(courseId, normalizedNickname);
	} else {
		await canvas.users.removeCourseNickname(courseId);
	}

	const [course, overlays] = await Promise.all([
		canvas.courses.retrieve(Number(courseId), {
			include: ["term", "teachers"],
		}),
		getCourseOverlays(userId, [courseId]),
	]);

	return {
		courses: [normalizeCourse(course, fetchedAt)],
		courseOverlays: overlays,
		syncMeta: {
			scope: `course-nickname:${courseId}`,
			fetchedAt,
			source: "canvas",
		},
	};
}

function normalizeNickname(nickname: string | null | undefined): string | null {
	const value = typeof nickname === "string" ? nickname.trim() : nickname;
	if (!value) return null;
	return value;
}
