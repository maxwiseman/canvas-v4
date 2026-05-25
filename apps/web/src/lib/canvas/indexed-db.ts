import type { CanvasDebugSnapshot } from "@canvas-v4/canvas-sync";
import { emptyDebugSnapshot } from "@canvas-v4/canvas-sync";
import Dexie, { type Table } from "dexie";

import type { LocalMutation } from "./mutation-queue";

type SnapshotRow = {
	id: string;
	ownerId: string;
	snapshot: CanvasDebugSnapshot;
	updatedAt: string;
};

class CanvasDebugDexie extends Dexie {
	snapshots!: Table<SnapshotRow, string>;
	mutations!: Table<LocalMutation, string>;

	constructor() {
		super("canvas-v4-debug-cache");
		this.version(1).stores({
			snapshots: "id, updatedAt",
		});
		this.version(2).stores({
			snapshots: "id, updatedAt",
			mutations: "id, namespace, operation, status, updatedAt",
		});
		this.version(3).stores({
			snapshots: "id, ownerId, updatedAt",
			mutations: "id, ownerId, namespace, operation, status, updatedAt",
		});
	}
}

let db: CanvasDebugDexie | undefined;

function getDb(): CanvasDebugDexie {
	db ??= new CanvasDebugDexie();
	return db;
}

export function canvasStorageId(ownerId: string): string {
	return `user:${ownerId}`;
}

export async function loadCanvasSnapshot(
	ownerId: string,
): Promise<CanvasDebugSnapshot> {
	const row = await getDb().snapshots.get(canvasStorageId(ownerId));
	return normalizeSnapshot(row?.snapshot);
}

export async function persistCanvasSnapshot(
	ownerId: string,
	snapshot: CanvasDebugSnapshot,
): Promise<void> {
	await getDb().snapshots.put({
		id: canvasStorageId(ownerId),
		ownerId,
		snapshot,
		updatedAt: new Date().toISOString(),
	});
}

export async function clearCanvasSnapshot(
	ownerId: string,
): Promise<CanvasDebugSnapshot> {
	await getDb().snapshots.delete(canvasStorageId(ownerId));
	return emptyDebugSnapshot();
}

export async function loadMutationQueue(
	ownerId: string,
): Promise<LocalMutation[]> {
	return getDb().mutations.where("ownerId").equals(ownerId).sortBy("updatedAt");
}

export async function persistMutationQueue(
	ownerId: string,
	mutations: LocalMutation[],
): Promise<void> {
	await getDb().transaction("rw", getDb().mutations, async () => {
		await getDb().mutations.where("ownerId").equals(ownerId).delete();
		if (mutations.length > 0)
			await getDb().mutations.bulkPut(
				mutations.map((mutation) => ({ ...mutation, ownerId })),
			);
	});
}

export async function clearMutationQueue(ownerId: string): Promise<void> {
	await getDb().mutations.where("ownerId").equals(ownerId).delete();
}

function normalizeSnapshot(
	snapshot: CanvasDebugSnapshot | undefined,
): CanvasDebugSnapshot {
	const empty = emptyDebugSnapshot();
	return {
		...empty,
		...snapshot,
		courseOverlays: snapshot?.courseOverlays ?? empty.courseOverlays,
		syncManifest: snapshot?.syncManifest ?? empty.syncManifest,
	};
}
