export function canvasKey(prefix: string, canvasId: unknown, courseId?: unknown): string {
  const id = String(canvasId ?? "unknown");
  if (courseId === undefined || courseId === null) return `${prefix}:${id}`;
  return `${prefix}:${String(courseId)}:${id}`;
}

export function safeCanvasId(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  return "unknown";
}
