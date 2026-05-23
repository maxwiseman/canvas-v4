import { createCanvasGateway } from "./gateway";
import {
  normalizeAssignment,
  normalizeAssignmentGroup,
  normalizeAnnouncement,
  normalizeCalendarEvent,
  normalizeCourse,
  normalizeEnrollment,
  normalizeModule,
  normalizeModuleItem,
  normalizeSubmission,
  normalizeTodo,
  normalizeUser,
} from "./normalize";
import type { CanvasEnvelope, CanvasSyncError } from "./types";
import { canvasErrorFromUnknown } from "./gateway";

export interface CanvasServerSyncOptions {
  token: string;
  domain: string;
  userId?: string;
}

export function missingCanvasConfigEnvelope(scope: string): CanvasEnvelope {
  const occurredAt = new Date().toISOString();
  return {
    syncMeta: {
      scope,
      fetchedAt: occurredAt,
      source: "canvas",
      errors: [
        {
          id: `error:${scope}:${occurredAt}`,
          scope,
          message: "Missing CANVAS_DOMAIN or CANVAS_ACCESS_TOKEN.",
          occurredAt,
        },
      ],
    },
  };
}

export async function getCanvasBootstrapEnvelope(options: CanvasServerSyncOptions): Promise<CanvasEnvelope> {
  return withCanvasErrors("bootstrap", async () => {
    const gateway = createCanvasGateway(options);
    const fetchedAt = new Date().toISOString();
    const [user, courses] = await Promise.all([
      gateway.run({ key: "self", priority: "visible", scope: "bootstrap" }, (canvas) => canvas.users.retrieveSelf()),
      gateway.run({ key: "active-courses", priority: "visible", scope: "bootstrap" }, (canvas) =>
        canvas.courses.list({ enrollment_state: "active", include: ["term", "teachers"] }).all(),
      ),
    ]);

    const enrollmentResults = await Promise.all(
      courses.map(async (course) => {
        try {
          const enrollments = await gateway.run(
            { key: `enrollments:${course.id}`, priority: "background", scope: "bootstrap" },
            (canvas) => canvas.courses.enrollments(course.id).list({ include: ["current_points"] }).all(),
          );
          return { enrollments, error: undefined };
        } catch (error) {
          return {
            enrollments: [],
            error: canvasErrorFromUnknown(error, `enrollments:${course.id}`),
          };
        }
      }),
    );
    const enrollments = enrollmentResults.flatMap((result) => result.enrollments);
    const errors = enrollmentResults.flatMap((result) => (result.error ? [result.error] : []));

    return {
      users: [normalizeUser(user, fetchedAt)],
      courses: courses.map((course) => normalizeCourse(course, fetchedAt)),
      enrollments: enrollments.map((enrollment) => normalizeEnrollment(enrollment, fetchedAt)),
      syncMeta: {
        scope: "bootstrap",
        fetchedAt,
        source: "canvas",
        ...(errors.length > 0 ? { errors } : {}),
      },
    };
  });
}

export async function syncCanvasDashboardEnvelope(options: CanvasServerSyncOptions): Promise<CanvasEnvelope> {
  return withCanvasErrors("dashboard", async () => {
    const gateway = createCanvasGateway(options);
    const fetchedAt = new Date().toISOString();
    const now = new Date();
    const startsAt = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1_000).toISOString();
    const endsAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1_000).toISOString();

    const [courses, todos] = await Promise.all([
      gateway.run({ key: "active-courses", priority: "visible", scope: "dashboard" }, (canvas) =>
        canvas.courses.list({ enrollment_state: "active", include: ["term"] }).all(),
      ),
      gateway.run({ key: "todos", priority: "background", scope: "dashboard" }, (canvas) => canvas.users.todoItems()),
    ]);

    const [assignmentGroups, assignments, submissions, calendarEvents] = await Promise.all([
      Promise.all(
        courses.map((course) =>
          gateway.run({ key: `assignment-groups:${course.id}`, priority: "background", scope: "dashboard" }, (canvas) =>
            canvas.courses.assignmentGroups(course.id).all(),
          ),
        ),
      ).then((groups) => groups.flatMap((courseGroups, index) => ({ course: courses[index], groups: courseGroups }))),
      Promise.all(
        courses.map((course) =>
          gateway.run({ key: `assignments:${course.id}:dashboard`, priority: "background", scope: "dashboard" }, (canvas) =>
            canvas.courses.assignments(course.id).list({ include: ["submission"], bucket: "future" }).all(),
          ),
        ),
      ).then((items) => items.flatMap((courseAssignments, index) => ({ course: courses[index], assignments: courseAssignments }))),
      Promise.all(
        courses.map((course) =>
          gateway.run({ key: `submissions:${course.id}:self`, priority: "background", scope: "dashboard" }, (canvas) =>
            canvas.courses.submissions(course.id).listForStudent({ include: ["submission_comments"] }).all(),
          ),
        ),
      ).then((items) => items.flatMap((courseSubmissions, index) => ({ course: courses[index], submissions: courseSubmissions }))),
      gateway.run({ key: "calendar-events:dashboard", priority: "background", scope: "dashboard" }, (canvas) =>
        canvas.calendarEvents
          .list({
            start_date: startsAt,
            end_date: endsAt,
            context_codes: courses.map((course) => `course_${course.id}`),
          })
          .all(),
      ),
    ]);

    return {
      courses: courses.map((course) => normalizeCourse(course, fetchedAt)),
      canvasTodos: todos.map((todo) => normalizeTodo(todo, fetchedAt)),
      assignmentGroups: assignmentGroups.flatMap(({ course, groups }) =>
        groups.map((group) => normalizeAssignmentGroup(group, fetchedAt, course?.id ?? "unknown")),
      ),
      assignments: assignments.flatMap(({ course, assignments: courseAssignments }) =>
        courseAssignments.map((assignment) => normalizeAssignment(assignment, fetchedAt, course?.id ?? "unknown")),
      ),
      submissions: submissions.flatMap(({ course, submissions: courseSubmissions }) =>
        courseSubmissions.map((submission) => normalizeSubmission(submission, fetchedAt, course?.id ?? "unknown")),
      ),
      calendarEvents: calendarEvents.map((event) => normalizeCalendarEvent(event, fetchedAt)),
      syncMeta: {
        scope: "dashboard",
        fetchedAt,
        source: "canvas",
      },
    };
  });
}

export async function syncCourseBasicsEnvelope(options: CanvasServerSyncOptions, courseId: string): Promise<CanvasEnvelope> {
  return withCanvasErrors(`course:${courseId}`, async () => {
    const gateway = createCanvasGateway(options);
    const fetchedAt = new Date().toISOString();
    const course = await gateway.run({ key: `course:${courseId}`, priority: "visible", scope: `course:${courseId}` }, (canvas) =>
        canvas.courses.retrieve(Number(courseId), { include: ["term", "teachers"] }),
    );

    const [groupsResult, assignmentsResult, submissionsResult] = await Promise.allSettled([
      gateway.run({ key: `assignment-groups:${courseId}`, priority: "background", scope: `course:${courseId}` }, (canvas) =>
        canvas.courses.assignmentGroups(Number(courseId)).all(),
      ),
      gateway.run({ key: `assignments:${courseId}:all`, priority: "background", scope: `course:${courseId}` }, (canvas) =>
        canvas.courses.assignments(Number(courseId)).list({ include: ["submission"] }).all(),
      ),
      gateway.run({ key: `submissions:${courseId}:self`, priority: "background", scope: `course:${courseId}` }, (canvas) =>
        canvas.courses.submissions(Number(courseId)).listForStudent({ include: ["submission_comments"] }).all(),
      ),
    ]);
    const groups = groupsResult.status === "fulfilled" ? groupsResult.value : [];
    const assignments = assignmentsResult.status === "fulfilled" ? assignmentsResult.value : [];
    const submissions = submissionsResult.status === "fulfilled" ? submissionsResult.value : [];
    const errors = [
      groupsResult.status === "rejected" ? canvasErrorFromUnknown(groupsResult.reason, `assignment-groups:${courseId}`) : undefined,
      assignmentsResult.status === "rejected" ? canvasErrorFromUnknown(assignmentsResult.reason, `assignments:${courseId}`) : undefined,
      submissionsResult.status === "rejected" ? canvasErrorFromUnknown(submissionsResult.reason, `submissions:${courseId}`) : undefined,
    ].filter((error): error is CanvasSyncError => Boolean(error));

    return {
      courses: [normalizeCourse(course, fetchedAt)],
      assignmentGroups: groups.map((group) => normalizeAssignmentGroup(group, fetchedAt, courseId)),
      assignments: assignments.map((assignment) => normalizeAssignment(assignment, fetchedAt, courseId)),
      submissions: submissions.map((submission) => normalizeSubmission(submission, fetchedAt, courseId)),
      syncMeta: {
        scope: `course:${courseId}`,
        fetchedAt,
        source: "canvas",
        ...(errors.length > 0 ? { errors } : {}),
      },
    };
  });
}

export async function syncCourseModulesEnvelope(options: CanvasServerSyncOptions, courseId: string): Promise<CanvasEnvelope> {
  return withCanvasErrors(`modules:${courseId}`, async () => {
    const gateway = createCanvasGateway(options);
    const fetchedAt = new Date().toISOString();
    const modules = await gateway.run({ key: `modules:${courseId}`, priority: "idle", scope: `modules:${courseId}` }, (canvas) =>
      canvas.courses.modules(Number(courseId)).list({ include: ["items", "content_details"] }).all(),
    );

    const moduleItems = modules.flatMap((module) =>
      (module.items ?? []).map((item) => normalizeModuleItem(item, fetchedAt, courseId, module.id)),
    );

    return {
      modules: modules.map((module) => normalizeModule(module, fetchedAt, courseId)),
      moduleItems,
      syncMeta: {
        scope: `modules:${courseId}`,
        fetchedAt,
        source: "canvas",
      },
    };
  });
}

export async function syncCourseAnnouncementsEnvelope(options: CanvasServerSyncOptions, courseId: string): Promise<CanvasEnvelope> {
  return withCanvasErrors(`announcements:${courseId}`, async () => {
    const gateway = createCanvasGateway(options);
    const fetchedAt = new Date().toISOString();
    const announcements = await gateway.run(
      { key: `announcements:${courseId}`, priority: "background", scope: `announcements:${courseId}` },
      (canvas) => canvas.courses.announcements(Number(courseId)).list({ active_only: true }).all(),
    );

    return {
      announcements: announcements.map((announcement) => normalizeAnnouncement(announcement, fetchedAt, courseId)),
      syncMeta: {
        scope: `announcements:${courseId}`,
        fetchedAt,
        source: "canvas",
      },
    };
  });
}

export async function syncAssignmentDetailEnvelope(
  options: CanvasServerSyncOptions,
  courseId: string,
  assignmentId: string,
): Promise<CanvasEnvelope> {
  return withCanvasErrors(`assignment:${courseId}:${assignmentId}`, async () => {
    const gateway = createCanvasGateway(options);
    const fetchedAt = new Date().toISOString();
    const [assignment, submission] = await Promise.all([
      gateway.run({ key: `assignment:${courseId}:${assignmentId}`, priority: "visible", scope: `assignment:${courseId}:${assignmentId}` }, (canvas) =>
        canvas.courses.assignments(Number(courseId)).retrieve(Number(assignmentId), { include: ["submission", "rubric"] }),
      ),
      gateway.run({ key: `submission:${courseId}:${assignmentId}:self`, priority: "visible", scope: `assignment:${courseId}:${assignmentId}` }, (canvas) =>
        canvas.courses.submissions(Number(courseId)).retrieveForSelf(Number(assignmentId), { include: ["submission_comments", "rubric_assessment"] }),
      ),
    ]);

    return {
      assignments: [normalizeAssignment(assignment, fetchedAt, courseId, "detail")],
      submissions: [normalizeSubmission(submission, fetchedAt, courseId)],
      syncMeta: {
        scope: `assignment:${courseId}:${assignmentId}`,
        fetchedAt,
        source: "canvas",
      },
    };
  });
}

async function withCanvasErrors(scope: string, run: () => Promise<CanvasEnvelope>): Promise<CanvasEnvelope> {
  try {
    return await run();
  } catch (error) {
    const syncError: CanvasSyncError = canvasErrorFromUnknown(error, scope);
    return {
      syncMeta: {
        scope,
        fetchedAt: syncError.occurredAt,
        source: "canvas",
        errors: [syncError],
      },
    };
  }
}
