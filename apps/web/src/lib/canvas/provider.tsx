import {
	type CanvasCourse,
	type CanvasCourseOverlay,
	type CanvasDebugSnapshot,
	type CanvasEnvelope,
	type CanvasSyncJob,
	emptyDebugSnapshot,
	mergeEnvelope,
} from "@canvas-v4/canvas-sync";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	useTransition,
} from "react";
import { authClient } from "@/lib/auth-client";
import {
	getCanvasBootstrap,
	syncAssignmentDetail,
	syncCanvasDashboard,
	syncCourseAnnouncements,
	syncCourseBasics,
	syncCourseModules,
	updateCourseIcon,
	updateCourseNickname,
} from "@/lib/canvas/api-client";
import { replaceCanvasCollections } from "@/lib/canvas/collections";
import {
	clearCanvasSnapshot,
	clearMutationQueue,
	loadCanvasSnapshot,
	loadMutationQueue,
	persistCanvasSnapshot,
	persistMutationQueue,
} from "@/lib/canvas/indexed-db";
import {
	createQueuedMutation,
	type LocalMutation,
	markMutationAcked,
	markMutationError,
	markMutationPushing,
	type QueueMutationInput,
} from "@/lib/canvas/mutation-queue";
import {
	getAssignment,
	getCourse,
	listAnnouncementsByCourse,
	listAssignmentGroupsByCourse,
	listAssignmentsByCourse,
	listCalendarEvents,
	listCourses,
	listEnrollmentsByCourse,
	listModuleItemsByCourse,
	listModuleItemsByModule,
	listModulesByCourse,
	listSubmissionsByCourse,
	listTodos,
} from "@/lib/canvas/selectors";

type SyncAction =
	| "bootstrap"
	| "dashboard"
	| "course"
	| "course-icon"
	| "course-nickname"
	| "modules"
	| "announcements"
	| "assignment";

export interface CanvasDataClient {
	hydrated: boolean;
	isPending: boolean;
	snapshot: CanvasDebugSnapshot;
	pendingMutations: LocalMutation[];
	courses: {
		list: () => ReturnType<typeof listCourses>;
		get: (courseId: string) => ReturnType<typeof getCourse>;
		setIcon: (courseId: string, icon: string | null) => Promise<void>;
		setNickname: (courseId: string, nickname: string | null) => Promise<void>;
	};
	assignments: {
		listByCourse: (
			courseId: string,
		) => ReturnType<typeof listAssignmentsByCourse>;
		get: (
			courseId: string,
			assignmentId: string | number,
		) => ReturnType<typeof getAssignment>;
	};
	assignmentGroups: {
		listByCourse: (
			courseId: string,
		) => ReturnType<typeof listAssignmentGroupsByCourse>;
	};
	submissions: {
		listByCourse: (
			courseId: string,
		) => ReturnType<typeof listSubmissionsByCourse>;
	};
	enrollments: {
		listByCourse: (
			courseId: string,
		) => ReturnType<typeof listEnrollmentsByCourse>;
	};
	modules: {
		listByCourse: (courseId: string) => ReturnType<typeof listModulesByCourse>;
	};
	announcements: {
		listByCourse: (
			courseId: string,
		) => ReturnType<typeof listAnnouncementsByCourse>;
	};
	moduleItems: {
		listByCourse: (
			courseId: string,
		) => ReturnType<typeof listModuleItemsByCourse>;
		listByModule: (
			courseId: string,
			moduleId: string | number,
		) => ReturnType<typeof listModuleItemsByModule>;
	};
	todos: {
		list: () => ReturnType<typeof listTodos>;
	};
	calendarEvents: {
		list: () => ReturnType<typeof listCalendarEvents>;
	};
	sync: {
		bootstrap: () => Promise<void>;
		dashboard: () => Promise<void>;
		courseBasics: (courseId: string) => Promise<void>;
		courseModules: (courseId: string) => Promise<void>;
		courseAnnouncements: (courseId: string) => Promise<void>;
		assignmentDetail: (
			courseId: string,
			assignmentId: string | number,
		) => Promise<void>;
	};
	mutations: {
		queue: <TPayload>(
			input: QueueMutationInput<TPayload>,
		) => Promise<LocalMutation<TPayload>>;
		flush: () => Promise<void>;
		clearAcked: () => Promise<void>;
	};
	debug: {
		clearCache: () => Promise<void>;
		exportSnapshot: () => void;
	};
}

const CanvasDataContext = createContext<CanvasDataClient | undefined>(
	undefined,
);

export function CanvasDataProvider({ children }: { children: ReactNode }) {
	const [snapshot, setSnapshot] = useState<CanvasDebugSnapshot>(() =>
		emptyDebugSnapshot(),
	);
	const [pendingMutations, setPendingMutations] = useState<LocalMutation[]>([]);
	const [hydrated, setHydrated] = useState(false);
	const [isPending, startTransition] = useTransition();
	const snapshotRef = useRef(snapshot);
	const autoBootstrapStarted = useRef(false);
	const inFlightSyncs = useRef(new Set<string>());
	const latestCourseIconMutation = useRef(new Map<string, string>());
	const latestCourseNicknameMutation = useRef(new Map<string, string>());
	const { data: session, isPending: isSessionPending } =
		authClient.useSession();
	const ownerId = session?.user.id;

	useEffect(() => {
		snapshotRef.current = snapshot;
	}, [snapshot]);

	useEffect(() => {
		let cancelled = false;
		autoBootstrapStarted.current = false;
		inFlightSyncs.current.clear();

		if (isSessionPending) return;

		if (!ownerId) {
			const empty = emptyDebugSnapshot();
			snapshotRef.current = empty;
			setSnapshot(empty);
			setPendingMutations([]);
			replaceCanvasCollections(empty);
			setHydrated(true);
			return;
		}

		setHydrated(false);

		Promise.all([loadCanvasSnapshot(ownerId), loadMutationQueue(ownerId)])
			.then(([cachedSnapshot, cachedMutations]) => {
				if (cancelled) return;
				snapshotRef.current = cachedSnapshot;
				setSnapshot(cachedSnapshot);
				setPendingMutations(cachedMutations);
				replaceCanvasCollections(cachedSnapshot);
				setHydrated(true);
			})
			.catch((error) => {
				if (cancelled) return;
				const next = withLocalError(emptyDebugSnapshot(), "indexeddb", error);
				snapshotRef.current = next;
				setSnapshot(next);
				setHydrated(true);
			});

		return () => {
			cancelled = true;
		};
	}, [isSessionPending, ownerId]);

	const saveSnapshot = useCallback(
		(next: CanvasDebugSnapshot) => {
			if (!ownerId) return;
			snapshotRef.current = next;
			setSnapshot(next);
			replaceCanvasCollections(next);
			void persistCanvasSnapshot(ownerId, next);
		},
		[ownerId],
	);

	const updateSnapshot = useCallback(
		(updater: (current: CanvasDebugSnapshot) => CanvasDebugSnapshot) => {
			setSnapshot((current) => {
				const next = updater(current);
				snapshotRef.current = next;
				replaceCanvasCollections(next);
				if (ownerId) void persistCanvasSnapshot(ownerId, next);
				return next;
			});
		},
		[ownerId],
	);

	const updatePendingMutation = useCallback(
		(nextMutation: LocalMutation) => {
			if (!ownerId) return;
			setPendingMutations((current) => {
				const next = current.some((mutation) => mutation.id === nextMutation.id)
					? current.map((mutation) =>
							mutation.id === nextMutation.id ? nextMutation : mutation,
						)
					: [nextMutation, ...current];
				void persistMutationQueue(ownerId, next);
				return next;
			});
		},
		[ownerId],
	);

	const applyEnvelope = useCallback(
		(action: SyncAction, envelope: CanvasEnvelope) => {
			startTransition(() => {
				setSnapshot((current) => {
					const withoutRunningJob = upsertJob(current, {
						id: action,
						scope: envelope.syncMeta.scope,
						priority: action === "bootstrap" ? "visible" : "background",
						status: envelope.syncMeta.errors?.length ? "error" : "success",
						finishedAt: envelope.syncMeta.fetchedAt,
						message: envelope.syncMeta.errors?.[0]?.message,
					});
					const next = mergeEnvelope(withoutRunningJob, envelope);
					snapshotRef.current = next;
					replaceCanvasCollections(next);
					if (ownerId) void persistCanvasSnapshot(ownerId, next);
					return next;
				});
			});
		},
		[ownerId],
	);

	const runSync = useCallback(
		async (
			action: SyncAction,
			courseId?: string,
			entityId?: string | number,
		) => {
			if (!ownerId) return;
			const syncKey = courseId
				? entityId
					? `${action}:${courseId}:${entityId}`
					: `${action}:${courseId}`
				: action;
			if (inFlightSyncs.current.has(syncKey)) return;
			inFlightSyncs.current.add(syncKey);

			setSnapshot((current) =>
				upsertJob(current, {
					id: action,
					scope: syncKey,
					priority: action === "bootstrap" ? "visible" : "background",
					status: "running",
					startedAt: new Date().toISOString(),
				}),
			);

			try {
				const envelope =
					action === "bootstrap"
						? await getCanvasBootstrap()
						: action === "dashboard"
							? await syncCanvasDashboard()
							: action === "assignment"
								? await syncAssignmentDetail({
										courseId: courseId ?? "",
										assignmentId: String(entityId ?? ""),
									})
								: action === "announcements"
									? await syncCourseAnnouncements({ courseId: courseId ?? "" })
									: action === "modules"
										? await syncCourseModules({ courseId: courseId ?? "" })
										: await syncCourseBasics({ courseId: courseId ?? "" });
				applyEnvelope(action, envelope);
			} catch (error) {
				setSnapshot((current) => {
					const next = upsertJob(withLocalError(current, syncKey, error), {
						id: action,
						scope: syncKey,
						priority: action === "bootstrap" ? "visible" : "background",
						status: "error",
						finishedAt: new Date().toISOString(),
						message: error instanceof Error ? error.message : String(error),
					});
					snapshotRef.current = next;
					void persistCanvasSnapshot(ownerId, next);
					return next;
				});
			} finally {
				inFlightSyncs.current.delete(syncKey);
			}
		},
		[applyEnvelope, ownerId],
	);

	const setCourseIcon = useCallback(
		async (courseId: string, icon: string | null) => {
			if (!ownerId) return;
			const normalizedIcon = normalizeNullableString(icon);
			const mutation = markMutationPushing({
				...createQueuedMutation({
					namespace: "canvas",
					operation: "courses.setIcon",
					payload: { courseId, icon: normalizedIcon },
				}),
				ownerId,
			});
			latestCourseIconMutation.current.set(courseId, mutation.id);
			updatePendingMutation(mutation);

			const previousOverlay = snapshotRef.current.courseOverlays.find(
				(overlay) => overlay.canvasCourseId === courseId,
			);
			updateSnapshot((current) => {
				const next = replaceCourseOverlay(
					current,
					createOptimisticCourseOverlay({
						canvasCourseId: courseId,
						icon: normalizedIcon,
						userId: ownerId,
					}),
				);
				return upsertJob(next, {
					id: "course-icon",
					scope: `course-icon:${courseId}`,
					priority: "background",
					status: "running",
					startedAt: new Date().toISOString(),
				});
			});

			try {
				const envelope = await updateCourseIcon({
					courseId,
					icon: normalizedIcon,
				});
				updatePendingMutation(markMutationAcked(mutation));
				if (latestCourseIconMutation.current.get(courseId) === mutation.id) {
					latestCourseIconMutation.current.delete(courseId);
					applyEnvelope("course-icon", envelope);
				}
			} catch (error) {
				updatePendingMutation(markMutationError(mutation, error));
				if (latestCourseIconMutation.current.get(courseId) === mutation.id) {
					latestCourseIconMutation.current.delete(courseId);
					updateSnapshot((current) =>
						upsertJob(
							withLocalError(
								restoreCourseOverlay(current, courseId, previousOverlay),
								`course-icon:${courseId}`,
								error,
							),
							{
								id: "course-icon",
								scope: `course-icon:${courseId}`,
								priority: "background",
								status: "error",
								finishedAt: new Date().toISOString(),
								message: error instanceof Error ? error.message : String(error),
							},
						),
					);
				}
				throw error;
			}
		},
		[applyEnvelope, ownerId, updatePendingMutation, updateSnapshot],
	);

	const setCourseNickname = useCallback(
		async (courseId: string, nickname: string | null) => {
			if (!ownerId) return;
			const normalizedNickname = normalizeNullableString(nickname);
			const mutation = markMutationPushing({
				...createQueuedMutation({
					namespace: "canvas",
					operation: "courses.setNickname",
					payload: { courseId, nickname: normalizedNickname },
				}),
				ownerId,
			});
			latestCourseNicknameMutation.current.set(courseId, mutation.id);
			updatePendingMutation(mutation);

			const previousCourse = snapshotRef.current.courses.find(
				(course) =>
					course.sync.canvasId === courseId || String(course.id) === courseId,
			);
			updateSnapshot((current) => {
				if (!previousCourse) return current;
				const optimisticName =
					normalizedNickname ??
					previousCourse.original_name ??
					previousCourse.name;
				const next = {
					...current,
					courses: current.courses.map((course) =>
						course.sync.id === previousCourse?.sync.id
							? { ...course, name: optimisticName }
							: course,
					),
				};
				return upsertJob(next, {
					id: "course-nickname",
					scope: `course-nickname:${courseId}`,
					priority: "background",
					status: "running",
					startedAt: new Date().toISOString(),
				});
			});

			try {
				const envelope = await updateCourseNickname({
					courseId,
					nickname: normalizedNickname,
				});
				updatePendingMutation(markMutationAcked(mutation));
				if (
					latestCourseNicknameMutation.current.get(courseId) === mutation.id
				) {
					latestCourseNicknameMutation.current.delete(courseId);
					applyEnvelope("course-nickname", envelope);
				}
			} catch (error) {
				updatePendingMutation(markMutationError(mutation, error));
				if (
					latestCourseNicknameMutation.current.get(courseId) === mutation.id
				) {
					latestCourseNicknameMutation.current.delete(courseId);
					updateSnapshot((current) =>
						upsertJob(
							withLocalError(
								restoreCourse(current, previousCourse),
								`course-nickname:${courseId}`,
								error,
							),
							{
								id: "course-nickname",
								scope: `course-nickname:${courseId}`,
								priority: "background",
								status: "error",
								finishedAt: new Date().toISOString(),
								message: error instanceof Error ? error.message : String(error),
							},
						),
					);
				}
				throw error;
			}
		},
		[applyEnvelope, ownerId, updatePendingMutation, updateSnapshot],
	);
	const hasCachedCanvasData = hasAnyCanvasData(snapshot);

	useEffect(() => {
		if (!ownerId) return;
		if (!hydrated) return;
		if (autoBootstrapStarted.current) return;
		if (hasCachedCanvasData) return;
		autoBootstrapStarted.current = true;
		void runSync("bootstrap");
	}, [hasCachedCanvasData, hydrated, ownerId, runSync]);

	const queueMutation = useCallback(
		async <TPayload,>(input: QueueMutationInput<TPayload>) => {
			if (!ownerId)
				throw new Error(
					"Cannot queue a mutation without an authenticated user.",
				);
			const mutation = { ...createQueuedMutation(input), ownerId };
			setPendingMutations((current) => {
				const next = [mutation, ...current];
				void persistMutationQueue(ownerId, next);
				return next;
			});
			return mutation;
		},
		[ownerId],
	);

	const flushMutations = useCallback(async () => {
		if (!ownerId) return;
		setPendingMutations((current) => {
			const next = current.map((mutation) =>
				mutation.status === "queued"
					? markMutationError(
							mutation,
							"No mutation pusher registered for this operation yet.",
						)
					: mutation,
			);
			void persistMutationQueue(ownerId, next);
			return next;
		});
	}, [ownerId]);

	const clearAckedMutations = useCallback(async () => {
		if (!ownerId) return;
		setPendingMutations((current) => {
			const next = current.filter((mutation) => mutation.status !== "acked");
			void persistMutationQueue(ownerId, next);
			return next;
		});
	}, [ownerId]);

	const clearCache = useCallback(async () => {
		if (!ownerId) {
			const empty = emptyDebugSnapshot();
			setSnapshot(empty);
			replaceCanvasCollections(empty);
			setPendingMutations([]);
			return;
		}
		const empty = await clearCanvasSnapshot(ownerId);
		await clearMutationQueue(ownerId);
		setPendingMutations([]);
		saveSnapshot(empty);
	}, [ownerId, saveSnapshot]);

	const exportSnapshot = useCallback(() => {
		const blob = new Blob(
			[JSON.stringify({ snapshot, pendingMutations }, null, 2)],
			{
				type: "application/json",
			},
		);
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = `canvas-debug-${new Date().toISOString()}.json`;
		anchor.click();
		URL.revokeObjectURL(url);
	}, [pendingMutations, snapshot]);

	const client = useMemo<CanvasDataClient>(
		() => ({
			hydrated,
			isPending,
			snapshot,
			pendingMutations,
			courses: {
				list: () => listCourses(snapshot),
				get: (courseId) => getCourse(snapshot, courseId),
				setIcon: setCourseIcon,
				setNickname: setCourseNickname,
			},
			assignments: {
				listByCourse: (courseId) => listAssignmentsByCourse(snapshot, courseId),
				get: (courseId, assignmentId) =>
					getAssignment(snapshot, courseId, assignmentId),
			},
			assignmentGroups: {
				listByCourse: (courseId) =>
					listAssignmentGroupsByCourse(snapshot, courseId),
			},
			submissions: {
				listByCourse: (courseId) => listSubmissionsByCourse(snapshot, courseId),
			},
			enrollments: {
				listByCourse: (courseId) => listEnrollmentsByCourse(snapshot, courseId),
			},
			modules: {
				listByCourse: (courseId) => listModulesByCourse(snapshot, courseId),
			},
			announcements: {
				listByCourse: (courseId) =>
					listAnnouncementsByCourse(snapshot, courseId),
			},
			moduleItems: {
				listByCourse: (courseId) => listModuleItemsByCourse(snapshot, courseId),
				listByModule: (courseId, moduleId) =>
					listModuleItemsByModule(snapshot, courseId, moduleId),
			},
			todos: {
				list: () => listTodos(snapshot),
			},
			calendarEvents: {
				list: () => listCalendarEvents(snapshot),
			},
			sync: {
				bootstrap: () => runSync("bootstrap"),
				dashboard: () => runSync("dashboard"),
				courseBasics: (courseId) => runSync("course", courseId),
				courseModules: (courseId) => runSync("modules", courseId),
				courseAnnouncements: (courseId) => runSync("announcements", courseId),
				assignmentDetail: (courseId, assignmentId) =>
					runSync("assignment", courseId, assignmentId),
			},
			mutations: {
				queue: queueMutation,
				flush: flushMutations,
				clearAcked: clearAckedMutations,
			},
			debug: {
				clearCache,
				exportSnapshot,
			},
		}),
		[
			clearAckedMutations,
			clearCache,
			exportSnapshot,
			flushMutations,
			hydrated,
			isPending,
			pendingMutations,
			queueMutation,
			runSync,
			setCourseIcon,
			setCourseNickname,
			snapshot,
		],
	);

	return (
		<CanvasDataContext.Provider value={client}>
			{children}
		</CanvasDataContext.Provider>
	);
}

export function useCanvasData(): CanvasDataClient {
	const client = useContext(CanvasDataContext);
	if (!client)
		throw new Error("useCanvasData must be used inside CanvasDataProvider.");
	return client;
}

function upsertJob(
	snapshot: CanvasDebugSnapshot,
	job: CanvasSyncJob,
): CanvasDebugSnapshot {
	const byId = new Map(snapshot.syncJobs.map((item) => [item.id, item]));
	byId.set(job.id, { ...byId.get(job.id), ...job });
	return {
		...snapshot,
		syncJobs: [...byId.values()].sort((a, b) =>
			(b.startedAt ?? "").localeCompare(a.startedAt ?? ""),
		),
	};
}

function withLocalError(
	snapshot: CanvasDebugSnapshot,
	scope: string,
	error: unknown,
): CanvasDebugSnapshot {
	const occurredAt = new Date().toISOString();
	return {
		...snapshot,
		syncErrors: [
			{
				id: `error:${scope}:${occurredAt}`,
				scope,
				message: error instanceof Error ? error.message : String(error),
				occurredAt,
			},
			...snapshot.syncErrors,
		],
	};
}

function hasAnyCanvasData(snapshot: CanvasDebugSnapshot): boolean {
	return (
		snapshot.users.length > 0 ||
		snapshot.courses.length > 0 ||
		snapshot.assignments.length > 0
	);
}

function normalizeNullableString(value: string | null): string | null {
	const normalized = value?.trim();
	return normalized ? normalized : null;
}

function createOptimisticCourseOverlay({
	canvasCourseId,
	icon,
	userId,
}: {
	canvasCourseId: string;
	icon: string | null;
	userId: string;
}): CanvasCourseOverlay {
	const now = new Date().toISOString();
	const id = `course-overlay:${userId}:${canvasCourseId}`;
	return {
		id,
		userId,
		canvasCourseId,
		icon,
		createdAt: now,
		updatedAt: now,
		sync: {
			id,
			canvasId: canvasCourseId,
			courseId: canvasCourseId,
			fetchedAt: now,
			source: "app",
		},
	};
}

function replaceCourseOverlay(
	snapshot: CanvasDebugSnapshot,
	overlay: CanvasCourseOverlay,
): CanvasDebugSnapshot {
	return {
		...snapshot,
		courseOverlays: [
			...snapshot.courseOverlays.filter(
				(item) => item.canvasCourseId !== overlay.canvasCourseId,
			),
			overlay,
		],
	};
}

function restoreCourseOverlay(
	snapshot: CanvasDebugSnapshot,
	courseId: string,
	previousOverlay: CanvasCourseOverlay | undefined,
): CanvasDebugSnapshot {
	const courseOverlays = snapshot.courseOverlays.filter(
		(overlay) => overlay.canvasCourseId !== courseId,
	);
	return {
		...snapshot,
		courseOverlays: previousOverlay
			? [...courseOverlays, previousOverlay]
			: courseOverlays,
	};
}

function restoreCourse(
	snapshot: CanvasDebugSnapshot,
	previousCourse: CanvasCourse | undefined,
): CanvasDebugSnapshot {
	if (!previousCourse) return snapshot;
	return {
		...snapshot,
		courses: snapshot.courses.map((course) =>
			course.sync.id === previousCourse.sync.id ? previousCourse : course,
		),
	};
}
