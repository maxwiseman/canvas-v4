import { describe, expect, test } from "bun:test";
import {
	type CanvasCourseOverlay,
	emptyDebugSnapshot,
	normalizeCourse,
} from "@canvas-v4/canvas-sync";

import { getCourse, listCourses } from "./selectors";

describe("canvas selectors", () => {
	test("merges app-owned course icons into listed courses", () => {
		const snapshot = emptyDebugSnapshot();
		const fetchedAt = "2026-01-01T00:00:00.000Z";
		snapshot.courses.push(
			normalizeCourse({ id: 1, name: "Biology" } as never, fetchedAt),
		);
		snapshot.courseOverlays.push(
			courseOverlay("user-1", "1", "microscope", fetchedAt),
		);

		const [course] = listCourses(snapshot);

		expect(course?.name).toBe("Biology");
		expect(course?.app.icon).toBe("microscope");
	});

	test("returns null icon when a course has no overlay", () => {
		const snapshot = emptyDebugSnapshot();
		snapshot.courses.push(
			normalizeCourse(
				{ id: 1, name: "Biology" } as never,
				"2026-01-01T00:00:00.000Z",
			),
		);

		expect(getCourse(snapshot, "1")?.app.icon).toBeNull();
	});
});

function courseOverlay(
	userId: string,
	canvasCourseId: string,
	icon: string | null,
	updatedAt: string,
): CanvasCourseOverlay {
	return {
		id: `course-overlay:${userId}:${canvasCourseId}`,
		userId,
		canvasCourseId,
		icon,
		createdAt: updatedAt,
		updatedAt,
		sync: {
			id: `course-overlay:${userId}:${canvasCourseId}`,
			canvasId: canvasCourseId,
			courseId: canvasCourseId,
			fetchedAt: updatedAt,
			source: "app",
		},
	};
}
