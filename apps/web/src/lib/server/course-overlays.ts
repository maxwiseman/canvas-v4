import type { CanvasCourseOverlay } from "@canvas-v4/canvas-sync";
import { db } from "@canvas-v4/db";
import { canvasCourseOverlays } from "@canvas-v4/db/schema";
import { and, eq, inArray } from "drizzle-orm";

type CourseOverlayRow = typeof canvasCourseOverlays.$inferSelect;

export async function getCourseOverlays(
	userId: string,
	courseIds?: string[],
): Promise<CanvasCourseOverlay[]> {
	if (courseIds && courseIds.length === 0) return [];
	const rows = await db
		.select()
		.from(canvasCourseOverlays)
		.where(
			courseIds
				? and(
						eq(canvasCourseOverlays.userId, userId),
						inArray(canvasCourseOverlays.canvasCourseId, courseIds),
					)
				: eq(canvasCourseOverlays.userId, userId),
		);

	return rows.map(toCanvasCourseOverlay);
}

export async function upsertCourseIcon(
	userId: string,
	canvasCourseId: string,
	icon: string | null | undefined,
): Promise<CanvasCourseOverlay> {
	const now = new Date();
	const normalizedIcon = normalizeIcon(icon);
	const [row] = await db
		.insert(canvasCourseOverlays)
		.values({
			id: courseOverlayId(userId, canvasCourseId),
			userId,
			canvasCourseId,
			icon: normalizedIcon,
			updatedAt: now,
		})
		.onConflictDoUpdate({
			target: [
				canvasCourseOverlays.userId,
				canvasCourseOverlays.canvasCourseId,
			],
			set: {
				icon: normalizedIcon,
				updatedAt: now,
			},
		})
		.returning();

	if (!row) throw new Error("Failed to save course icon.");
	return toCanvasCourseOverlay(row);
}

export function toCanvasCourseOverlay(
	row: CourseOverlayRow,
): CanvasCourseOverlay {
	const updatedAt = toIsoString(row.updatedAt);
	return {
		id: row.id,
		userId: row.userId,
		canvasCourseId: row.canvasCourseId,
		icon: row.icon,
		createdAt: toIsoString(row.createdAt),
		updatedAt,
		sync: {
			id: row.id,
			canvasId: row.canvasCourseId,
			courseId: row.canvasCourseId,
			fetchedAt: updatedAt,
			source: "app",
		},
	};
}

function courseOverlayId(userId: string, canvasCourseId: string): string {
	return `course-overlay:${userId}:${canvasCourseId}`;
}

function normalizeIcon(icon: string | null | undefined): string | null {
	const value = typeof icon === "string" ? icon.trim() : icon;
	return value ? value : null;
}

function toIsoString(value: Date | string): string {
	return value instanceof Date
		? value.toISOString()
		: new Date(value).toISOString();
}
