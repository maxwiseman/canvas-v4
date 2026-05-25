import type {
	CanvasCollectionName,
	CanvasDebugSnapshot,
	CanvasEntity,
	CanvasEnvelope,
	CanvasSyncError,
	SyncManifest,
} from "./types";

export function emptyDebugSnapshot(): CanvasDebugSnapshot {
	return {
		users: [],
		courses: [],
		enrollments: [],
		assignments: [],
		submissions: [],
		assignmentGroups: [],
		modules: [],
		moduleItems: [],
		pages: [],
		announcements: [],
		calendarEvents: [],
		canvasTodos: [],
		courseOverlays: [],
		syncJobs: [],
		syncErrors: [],
		syncManifest: [createEmptyManifest()],
	};
}

export function createEmptyManifest(): SyncManifest {
	return {
		id: "manifest",
		activeCourseIds: [],
		hydratedScopes: {
			courseAssignments: {},
			assignmentDetails: {},
			submissions: {},
			modules: {},
			announcements: {},
		},
		updatedAt: new Date(0).toISOString(),
	};
}

export function upsertBySyncId<T extends CanvasEntity<object>>(
	current: T[],
	incoming: T[],
): T[] {
	if (incoming.length === 0) return current;
	const byId = new Map(current.map((item) => [item.sync.id, item]));
	for (const item of incoming) {
		const existing = byId.get(item.sync.id);
		byId.set(item.sync.id, existing ? mergeEntity(existing, item) : item);
	}
	return [...byId.values()];
}

function mergeEntity<T extends CanvasEntity<object>>(
	existing: T,
	incoming: T,
): T {
	return {
		...existing,
		...incoming,
		sync: {
			...existing.sync,
			...incoming.sync,
			shapes: {
				...existing.sync.shapes,
				...incoming.sync.shapes,
			},
		},
	};
}

export function mergeEnvelope(
	snapshot: CanvasDebugSnapshot,
	envelope: CanvasEnvelope,
): CanvasDebugSnapshot {
	const manifest = updateManifest(
		snapshot.syncManifest[0] ?? createEmptyManifest(),
		envelope,
	);
	return {
		...snapshot,
		users: upsertBySyncId(snapshot.users, envelope.users ?? []),
		courses: upsertBySyncId(snapshot.courses, envelope.courses ?? []),
		enrollments: upsertBySyncId(
			snapshot.enrollments,
			envelope.enrollments ?? [],
		),
		assignments: upsertBySyncId(
			snapshot.assignments,
			envelope.assignments ?? [],
		),
		submissions: upsertBySyncId(
			snapshot.submissions,
			envelope.submissions ?? [],
		),
		assignmentGroups: upsertBySyncId(
			snapshot.assignmentGroups,
			envelope.assignmentGroups ?? [],
		),
		modules: upsertBySyncId(snapshot.modules, envelope.modules ?? []),
		moduleItems: upsertBySyncId(
			snapshot.moduleItems,
			envelope.moduleItems ?? [],
		),
		pages: upsertBySyncId(snapshot.pages, envelope.pages ?? []),
		announcements: upsertBySyncId(
			snapshot.announcements,
			envelope.announcements ?? [],
		),
		calendarEvents: upsertBySyncId(
			snapshot.calendarEvents,
			envelope.calendarEvents ?? [],
		),
		canvasTodos: upsertBySyncId(
			snapshot.canvasTodos,
			envelope.canvasTodos ?? [],
		),
		courseOverlays: upsertBySyncId(
			snapshot.courseOverlays,
			envelope.courseOverlays ?? [],
		),
		syncErrors: upsertErrors(
			snapshot.syncErrors,
			envelope.syncMeta.errors ?? [],
		),
		syncManifest: [manifest],
	};
}

function upsertErrors(
	current: CanvasSyncError[],
	incoming: CanvasSyncError[],
): CanvasSyncError[] {
	if (incoming.length === 0) return current;
	const byId = new Map(current.map((item) => [item.id, item]));
	for (const item of incoming) byId.set(item.id, item);
	return [...byId.values()].sort((a, b) =>
		b.occurredAt.localeCompare(a.occurredAt),
	);
}

function updateManifest(
	manifest: SyncManifest,
	envelope: CanvasEnvelope,
): SyncManifest {
	const stamp = {
		fetchedAt: envelope.syncMeta.fetchedAt,
		source: envelope.syncMeta.source,
		errorCount: envelope.syncMeta.errors?.length ?? 0,
	};
	const next: SyncManifest = {
		...manifest,
		activeCourseIds:
			envelope.courses?.map((course) => course.sync.canvasId) ??
			manifest.activeCourseIds,
		hydratedScopes: {
			dashboard:
				envelope.syncMeta.scope === "dashboard" ||
				envelope.syncMeta.scope === "bootstrap"
					? stamp
					: manifest.hydratedScopes.dashboard,
			courseAssignments: { ...manifest.hydratedScopes.courseAssignments },
			assignmentDetails: { ...manifest.hydratedScopes.assignmentDetails },
			submissions: { ...manifest.hydratedScopes.submissions },
			modules: { ...manifest.hydratedScopes.modules },
			announcements: { ...(manifest.hydratedScopes.announcements ?? {}) },
		},
		updatedAt: envelope.syncMeta.fetchedAt,
	};

	if (envelope.syncMeta.scope.startsWith("course:")) {
		const courseId = envelope.syncMeta.scope.split(":")[1];
		if (courseId) next.hydratedScopes.courseAssignments[courseId] = stamp;
	}
	if (envelope.syncMeta.scope.startsWith("modules:")) {
		const courseId = envelope.syncMeta.scope.split(":")[1];
		if (courseId) next.hydratedScopes.modules[courseId] = stamp;
	}
	if (envelope.syncMeta.scope.startsWith("assignment:")) {
		const [, courseId, assignmentId] = envelope.syncMeta.scope.split(":");
		if (courseId && assignmentId)
			next.hydratedScopes.assignmentDetails[`${courseId}:${assignmentId}`] =
				stamp;
	}
	if (envelope.syncMeta.scope.startsWith("announcements:")) {
		const courseId = envelope.syncMeta.scope.split(":")[1];
		if (courseId) next.hydratedScopes.announcements[courseId] = stamp;
	}

	return next;
}

export function isScopeStale(
	stamp: { fetchedAt?: string } | undefined,
	maxAgeMs: number,
	now = Date.now(),
): boolean {
	if (!stamp?.fetchedAt) return true;
	const fetchedAt = Date.parse(stamp.fetchedAt);
	return Number.isNaN(fetchedAt) || now - fetchedAt > maxAgeMs;
}

export function collectionCount(
	snapshot: CanvasDebugSnapshot,
	name: CanvasCollectionName,
): number {
	return snapshot[name].length;
}
