import { useState } from "react";

import { useCanvasData } from "@/lib/canvas/provider";

export function useCanvasDebugSnapshot() {
  const canvas = useCanvasData();
  const [selectedCourseId, setSelectedCourseId] = useState("");

  return {
    activeCourses: canvas.courses.list(),
    clearCache: canvas.debug.clearCache,
    exportSnapshot: canvas.debug.exportSnapshot,
    hydrated: canvas.hydrated,
    isPending: canvas.isPending,
    pendingMutations: canvas.pendingMutations,
    runSync: (action: "bootstrap" | "dashboard" | "course" | "modules", courseId?: string) => {
      if (action === "bootstrap") return canvas.sync.bootstrap();
      if (action === "dashboard") return canvas.sync.dashboard();
      if (action === "modules") return canvas.sync.courseModules(courseId ?? selectedCourseId);
      return canvas.sync.courseBasics(courseId ?? selectedCourseId);
    },
    selectedCourseId,
    setSelectedCourseId,
    snapshot: canvas.snapshot,
  };
}
