import type { CanvasEnvelope } from "@canvas-v4/canvas-sync";

export async function getCanvasBootstrap(): Promise<CanvasEnvelope> {
	return fetchCanvasEnvelope("/api/canvas-sync/bootstrap");
}

export async function syncCanvasDashboard(): Promise<CanvasEnvelope> {
	return fetchCanvasEnvelope("/api/canvas-sync/dashboard");
}

export async function syncCourseBasics(data: {
	courseId: string;
}): Promise<CanvasEnvelope> {
	return fetchCanvasEnvelope("/api/canvas-sync/course", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

export async function updateCourseIcon(data: {
	courseId: string;
	icon: string | null;
}): Promise<CanvasEnvelope> {
	return fetchCanvasEnvelope("/api/canvas-sync/course-icon", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

export async function updateCourseNickname(data: {
	courseId: string;
	nickname: string | null;
}): Promise<CanvasEnvelope> {
	return fetchCanvasEnvelope("/api/canvas-sync/course-nickname", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

export async function syncCourseModules(data: {
	courseId: string;
}): Promise<CanvasEnvelope> {
	return fetchCanvasEnvelope("/api/canvas-sync/modules", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

export async function syncCourseAnnouncements(data: {
	courseId: string;
}): Promise<CanvasEnvelope> {
	return fetchCanvasEnvelope("/api/canvas-sync/announcements", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

export async function syncAssignmentDetail(data: {
	courseId: string;
	assignmentId: string;
}): Promise<CanvasEnvelope> {
	return fetchCanvasEnvelope("/api/canvas-sync/assignment", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

async function fetchCanvasEnvelope(
	input: string,
	init?: RequestInit,
): Promise<CanvasEnvelope> {
	const response = await fetch(input, {
		...init,
		headers: {
			"content-type": "application/json",
			...init?.headers,
		},
	});
	const data = (await response.json()) as CanvasEnvelope | { error?: string };
	if (!response.ok) {
		throw new Error(
			"error" in data && data.error
				? data.error
				: `Canvas sync request failed: ${response.status}`,
		);
	}
	return data as CanvasEnvelope;
}
