import type {
  CanvasAssignment,
  CanvasAssignmentGroup,
  CanvasCalendarEvent,
  CanvasCourse,
  CanvasDebugSnapshot,
  CanvasEnrollment,
  CanvasModule,
  CanvasModuleItem,
  CanvasSubmission,
  CanvasTodo,
  CanvasUser,
} from "@canvas-v4/canvas-sync";

export function listCourses(snapshot: CanvasDebugSnapshot): CanvasCourse[] {
  return [...snapshot.courses].sort((a, b) =>
    String(a.name ?? a.course_code ?? a.sync.canvasId).localeCompare(String(b.name ?? b.course_code ?? b.sync.canvasId)),
  );
}

export function getCourse(snapshot: CanvasDebugSnapshot, courseId: string): CanvasCourse | undefined {
  return snapshot.courses.find((course) => course.sync.canvasId === courseId || String(course.id) === courseId);
}

export function getCurrentUser(snapshot: CanvasDebugSnapshot): CanvasUser | undefined {
  return snapshot.users[0];
}

export function listAssignmentsByCourse(snapshot: CanvasDebugSnapshot, courseId: string): CanvasAssignment[] {
  return snapshot.assignments
    .filter((assignment) => assignment.sync.courseId === courseId)
    .sort((a, b) => String(a.due_at ?? "").localeCompare(String(b.due_at ?? "")));
}

export function getAssignment(
  snapshot: CanvasDebugSnapshot,
  courseId: string,
  assignmentId: string | number,
): CanvasAssignment | undefined {
  return listAssignmentsByCourse(snapshot, courseId).find(
    (assignment) => assignment.sync.canvasId === String(assignmentId) || String(assignment.id) === String(assignmentId),
  );
}

export function listAssignmentGroupsByCourse(snapshot: CanvasDebugSnapshot, courseId: string): CanvasAssignmentGroup[] {
  return snapshot.assignmentGroups
    .filter((group) => group.sync.courseId === courseId)
    .sort((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0));
}

export function listSubmissionsByCourse(snapshot: CanvasDebugSnapshot, courseId: string): CanvasSubmission[] {
  return snapshot.submissions
    .filter((submission) => submission.sync.courseId === courseId)
    .sort((a, b) => String(b.submitted_at ?? b.graded_at ?? "").localeCompare(String(a.submitted_at ?? a.graded_at ?? "")));
}

export function getSubmissionForAssignment(
  snapshot: CanvasDebugSnapshot,
  courseId: string,
  assignmentId: string | number,
): CanvasSubmission | undefined {
  return listSubmissionsByCourse(snapshot, courseId).find(
    (submission) => String(submission.assignment_id) === String(assignmentId),
  );
}

export function listEnrollmentsByCourse(snapshot: CanvasDebugSnapshot, courseId: string): CanvasEnrollment[] {
  return snapshot.enrollments.filter((enrollment) => enrollment.sync.courseId === courseId);
}

export function listModulesByCourse(snapshot: CanvasDebugSnapshot, courseId: string): CanvasModule[] {
  return snapshot.modules
    .filter((module) => module.sync.courseId === courseId)
    .sort((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0));
}

export function listModuleItemsByCourse(snapshot: CanvasDebugSnapshot, courseId: string): CanvasModuleItem[] {
  return snapshot.moduleItems
    .filter((item) => item.sync.courseId === courseId)
    .sort((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0));
}

export function listModuleItemsByModule(
  snapshot: CanvasDebugSnapshot,
  courseId: string,
  moduleId: string | number,
): CanvasModuleItem[] {
  return listModuleItemsByCourse(snapshot, courseId).filter((item) => String(item.module_id) === String(moduleId));
}

export function listTodos(snapshot: CanvasDebugSnapshot): CanvasTodo[] {
  return [...snapshot.canvasTodos].sort((a, b) => String(a.assignment?.due_at ?? "").localeCompare(String(b.assignment?.due_at ?? "")));
}

export function listCalendarEvents(snapshot: CanvasDebugSnapshot): CanvasCalendarEvent[] {
  return [...snapshot.calendarEvents].sort((a, b) => String(a.start_at ?? "").localeCompare(String(b.start_at ?? "")));
}
