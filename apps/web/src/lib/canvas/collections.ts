import type {
	CanvasDebugSnapshot,
	CanvasSyncError,
	CanvasSyncJob,
	SyncManifest,
} from "@canvas-v4/canvas-sync";
import {
	createCollection,
	localOnlyCollectionOptions,
} from "@tanstack/react-db";

type SnapshotArrayKey = keyof CanvasDebugSnapshot;

function createLocalCollection<
	T extends { sync?: { id?: string }; id?: string },
>(id: SnapshotArrayKey, getKey: (item: T) => string) {
	return createCollection(
		localOnlyCollectionOptions({
			id,
			getKey,
			initialData: [] as T[],
		}),
	);
}

export const canvasCollections = {
	users: createLocalCollection(
		"users",
		(item) => item.sync?.id ?? item.id ?? "unknown",
	),
	courses: createLocalCollection(
		"courses",
		(item) => item.sync?.id ?? item.id ?? "unknown",
	),
	enrollments: createLocalCollection(
		"enrollments",
		(item) => item.sync?.id ?? item.id ?? "unknown",
	),
	assignments: createLocalCollection(
		"assignments",
		(item) => item.sync?.id ?? item.id ?? "unknown",
	),
	submissions: createLocalCollection(
		"submissions",
		(item) => item.sync?.id ?? item.id ?? "unknown",
	),
	assignmentGroups: createLocalCollection(
		"assignmentGroups",
		(item) => item.sync?.id ?? item.id ?? "unknown",
	),
	modules: createLocalCollection(
		"modules",
		(item) => item.sync?.id ?? item.id ?? "unknown",
	),
	moduleItems: createLocalCollection(
		"moduleItems",
		(item) => item.sync?.id ?? item.id ?? "unknown",
	),
	pages: createLocalCollection(
		"pages",
		(item) => item.sync?.id ?? item.id ?? "unknown",
	),
	announcements: createLocalCollection(
		"announcements",
		(item) => item.sync?.id ?? item.id ?? "unknown",
	),
	calendarEvents: createLocalCollection(
		"calendarEvents",
		(item) => item.sync?.id ?? item.id ?? "unknown",
	),
	canvasTodos: createLocalCollection(
		"canvasTodos",
		(item) => item.sync?.id ?? item.id ?? "unknown",
	),
	courseOverlays: createLocalCollection(
		"courseOverlays",
		(item) => item.sync?.id ?? item.id ?? "unknown",
	),
	syncJobs: createLocalCollection<CanvasSyncJob>("syncJobs", (item) => item.id),
	syncErrors: createLocalCollection<CanvasSyncError>(
		"syncErrors",
		(item) => item.id,
	),
	syncManifest: createLocalCollection<SyncManifest>(
		"syncManifest",
		(item) => item.id,
	),
};

export function replaceCanvasCollections(snapshot: CanvasDebugSnapshot): void {
	for (const [name, collection] of Object.entries(canvasCollections)) {
		const writableCollection = collection as {
			toArray: { id?: string; sync?: { id?: string } }[];
			delete: (key: string) => void;
			insert: (row: { id?: string; sync?: { id?: string } }) => void;
			update: (
				key: string,
				callback: (draft: { id?: string; sync?: { id?: string } }) => void,
			) => void;
		};
		const rows = snapshot[name as SnapshotArrayKey] as {
			id?: string;
			sync?: { id?: string };
		}[];
		const current = writableCollection.toArray;
		const currentKeys = new Set(
			current.map((item) => item.sync?.id ?? item.id ?? "unknown"),
		);
		const nextKeys = new Set(
			rows.map((item) => item.sync?.id ?? item.id ?? "unknown"),
		);

		for (const key of currentKeys) {
			if (!nextKeys.has(key)) writableCollection.delete(key);
		}
		for (const row of rows) {
			const key = row.sync?.id ?? row.id ?? "unknown";
			if (currentKeys.has(key)) {
				writableCollection.update(key, (draft) => {
					Object.assign(draft, row);
				});
			} else {
				writableCollection.insert(row);
			}
		}
	}
}
