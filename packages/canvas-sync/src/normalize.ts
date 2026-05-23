import type {
  Announcement,
  Assignment,
  AssignmentGroup,
  CalendarEvent,
  Course,
  Enrollment,
  Module,
  ModuleItem,
  Page,
  Submission,
  TodoItem,
  User,
  UserProfile,
} from "@canvas-v4/canvas-sdk";

import { canvasKey, safeCanvasId } from "./ids";
import type {
  CanvasAnnouncement,
  CanvasAssignment,
  CanvasAssignmentGroup,
  CanvasCalendarEvent,
  CanvasCourse,
  CanvasEnrollment,
  CanvasModule,
  CanvasModuleItem,
  CanvasPage,
  CanvasSubmission,
  CanvasSyncSource,
  CanvasTodo,
  CanvasUser,
} from "./types";

function withSync<T extends object>(
  item: T,
  options: {
    prefix: string;
    canvasId: unknown;
    fetchedAt: string;
    source?: CanvasSyncSource;
    courseId?: unknown;
    shapes?: Record<string, string>;
  },
): T & { sync: { id: string; canvasId: string; fetchedAt: string; source: CanvasSyncSource; courseId?: string; shapes?: Record<string, string> } } {
  const courseId = options.courseId === undefined ? undefined : String(options.courseId);
  return {
    ...item,
    sync: {
      id: canvasKey(options.prefix, options.canvasId, courseId),
      canvasId: safeCanvasId(options.canvasId),
      fetchedAt: options.fetchedAt,
      source: options.source ?? "canvas",
      ...(courseId !== undefined ? { courseId } : {}),
      ...(options.shapes ? { shapes: options.shapes } : {}),
    },
  };
}

export function normalizeUser(user: User | UserProfile, fetchedAt: string): CanvasUser {
  return withSync(user, {
    prefix: "user",
    canvasId: "id" in user ? user.id : "self",
    fetchedAt,
  });
}

export function normalizeCourse(course: Course, fetchedAt: string): CanvasCourse {
  return withSync(course, { prefix: "course", canvasId: course.id, fetchedAt });
}

export function normalizeEnrollment(enrollment: Enrollment, fetchedAt: string): CanvasEnrollment {
  return withSync(enrollment, {
    prefix: "enrollment",
    canvasId: enrollment.id,
    fetchedAt,
    courseId: enrollment.course_id,
  });
}

export function normalizeAssignment(
  assignment: Assignment,
  fetchedAt: string,
  courseId: string | number,
  shape = "list",
): CanvasAssignment {
  return withSync(assignment, {
    prefix: "assignment",
    canvasId: assignment.id,
    courseId,
    fetchedAt,
    shapes: { [shape]: fetchedAt },
  });
}

export function normalizeSubmission(
  submission: Submission,
  fetchedAt: string,
  courseId: string | number,
): CanvasSubmission {
  return withSync(submission, {
    prefix: "submission",
    canvasId: submission.id ?? `${submission.assignment_id}:${submission.user_id}`,
    courseId,
    fetchedAt,
    shapes: { submission: fetchedAt },
  });
}

export function normalizeAssignmentGroup(
  group: AssignmentGroup,
  fetchedAt: string,
  courseId: string | number,
): CanvasAssignmentGroup {
  return withSync(group, {
    prefix: "assignmentGroup",
    canvasId: group.id,
    courseId,
    fetchedAt,
  });
}

export function normalizeModule(
  module: Module,
  fetchedAt: string,
  courseId: string | number,
): CanvasModule {
  return withSync(module, {
    prefix: "module",
    canvasId: module.id,
    courseId,
    fetchedAt,
  });
}

export function normalizeModuleItem(
  item: ModuleItem,
  fetchedAt: string,
  courseId: string | number,
  moduleId: string | number,
): CanvasModuleItem {
  return withSync(
    {
      ...item,
      module_id: Number(moduleId) as ModuleItem["module_id"],
    },
    {
      prefix: "moduleItem",
      canvasId: item.id,
      courseId,
      fetchedAt,
    },
  );
}

export function normalizePage(page: Page, fetchedAt: string, courseId: string | number): CanvasPage {
  return withSync(page, {
    prefix: "page",
    canvasId: page.page_id ?? page.url,
    courseId,
    fetchedAt,
  });
}

export function normalizeAnnouncement(
  announcement: Announcement,
  fetchedAt: string,
  courseId: string | number,
): CanvasAnnouncement {
  return withSync(announcement, {
    prefix: "announcement",
    canvasId: announcement.id,
    courseId,
    fetchedAt,
  });
}

export function normalizeCalendarEvent(event: CalendarEvent, fetchedAt: string): CanvasCalendarEvent {
  return withSync(event, {
    prefix: "calendarEvent",
    canvasId: event.id,
    fetchedAt,
  });
}

export function normalizeTodo(todo: TodoItem, fetchedAt: string): CanvasTodo {
  return withSync(todo, {
    prefix: "todo",
    canvasId: todo.assignment?.id ?? `${todo.type}:${todo.html_url ?? fetchedAt}`,
    fetchedAt,
  });
}
