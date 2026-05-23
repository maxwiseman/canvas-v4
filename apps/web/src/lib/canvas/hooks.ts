import { isScopeStale } from "@canvas-v4/canvas-sync";
import type { CreateDiscussionEntryParams, CreateSubmissionParams } from "@canvas-v4/canvas-sdk";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { useCanvasData } from "@/lib/canvas/provider";

const DEFAULT_STALE_MS = 5 * 60 * 1_000;

export interface CanvasAutoSyncOptions {
  enabled?: boolean;
  revalidateIfStale?: boolean;
  staleMs?: number;
}

export interface CanvasResourceResult<TData> {
  data: TData;
  isMissing: boolean;
  isRefreshing: boolean;
  isStale: boolean;
  refresh: () => Promise<void>;
}

export function useCurrentUser(options: CanvasAutoSyncOptions = {}) {
  const canvas = useCanvasData();
  const user = canvas.snapshot.users[0];
  const refresh = useCallback(async () => {
    await canvas.sync.bootstrap();
  }, [canvas.sync]);

  useAutoRefresh({
    enabled: (options.enabled ?? true) && !user,
    refresh,
    refreshKey: "bootstrap:user",
  });

  return {
    user,
    isMissing: !user,
    isRefreshing: isSyncRunning(canvas, "bootstrap"),
    isStale: false,
    refresh,
  };
}

export function useCourses(options: CanvasAutoSyncOptions = {}) {
  const canvas = useCanvasData();
  const courses = canvas.courses.list();
  const enabled = options.enabled ?? true;
  const refresh = useCallback(async () => {
    await canvas.sync.bootstrap();
  }, [canvas.sync]);

  useAutoRefresh({
    enabled: enabled && courses.length === 0,
    refresh,
    refreshKey: "bootstrap:courses",
  });

  return {
    courses,
    data: courses,
    isMissing: courses.length === 0,
    isRefreshing: isSyncRunning(canvas, "bootstrap"),
    isStale: false,
    refresh,
  };
}

export function useCourse(courseId: string | undefined, options: CanvasAutoSyncOptions = {}) {
  const canvas = useCanvasData();
  const enabled = options.enabled ?? true;
  const revalidateIfStale = options.revalidateIfStale ?? true;
  const staleMs = options.staleMs ?? DEFAULT_STALE_MS;
  const course = courseId ? canvas.courses.get(courseId) : undefined;
  const stamp = courseId ? canvas.snapshot.syncManifest[0]?.hydratedScopes.courseAssignments[courseId] : undefined;
  const isMissing = Boolean(courseId && !course);
  const isStale = Boolean(courseId && revalidateIfStale && isScopeStale(stamp, staleMs));
  const isRefreshing = useMemo(
    () => canvas.snapshot.syncJobs.some((job) => job.status === "running" && job.scope === `course:${courseId}`),
    [canvas.snapshot.syncJobs, courseId],
  );
  const refresh = useCallback(async () => {
    if (!courseId) return;
    await canvas.sync.courseBasics(courseId);
  }, [canvas.sync, courseId]);

  useAutoRefresh({
    enabled: enabled && Boolean(courseId) && (isMissing || isStale),
    refresh,
    refreshKey: `course:${courseId}`,
  });

  return {
    course,
    data: course,
    isMissing,
    isRefreshing,
    isStale,
    refresh,
  };
}

export function useCourseAssignments(courseId: string | undefined, options: CanvasAutoSyncOptions = {}) {
  const canvas = useCanvasData();
  const enabled = options.enabled ?? true;
  const revalidateIfStale = options.revalidateIfStale ?? true;
  const staleMs = options.staleMs ?? DEFAULT_STALE_MS;
  const assignments = courseId ? canvas.assignments.listByCourse(courseId) : [];
  const stamp = courseId ? canvas.snapshot.syncManifest[0]?.hydratedScopes.courseAssignments[courseId] : undefined;
  const isMissing = Boolean(courseId && assignments.length === 0);
  const isStale = Boolean(courseId && revalidateIfStale && isScopeStale(stamp, staleMs));
  const refresh = useCallback(async () => {
    if (!courseId) return;
    await canvas.sync.courseBasics(courseId);
  }, [canvas.sync, courseId]);

  useAutoRefresh({
    enabled: enabled && Boolean(courseId) && (isMissing || isStale),
    refresh,
    refreshKey: `assignments:${courseId}`,
  });

  return {
    assignments,
    data: assignments,
    isMissing,
    isRefreshing: isSyncRunning(canvas, `course:${courseId}`),
    isStale,
    refresh,
  };
}

export function useAssignmentDetail(
  courseId: string | undefined,
  assignmentId: string | number | undefined,
  options: CanvasAutoSyncOptions = {},
) {
  const canvas = useCanvasData();
  const enabled = options.enabled ?? true;
  const revalidateIfStale = options.revalidateIfStale ?? true;
  const staleMs = options.staleMs ?? DEFAULT_STALE_MS;
  const assignment = courseId && assignmentId ? canvas.assignments.get(courseId, assignmentId) : undefined;
  const submission = courseId && assignmentId
    ? canvas.submissions.listByCourse(courseId).find((item) => String(item.assignment_id) === String(assignmentId))
    : undefined;
  const stamp = courseId && assignmentId
    ? canvas.snapshot.syncManifest[0]?.hydratedScopes.assignmentDetails[`${courseId}:${assignmentId}`]
    : undefined;
  const isMissing = Boolean(courseId && assignmentId && !assignment);
  const isStale = Boolean(courseId && assignmentId && revalidateIfStale && isScopeStale(stamp, staleMs));
  const syncScope = `assignment:${courseId}:${assignmentId}`;
  const refresh = useCallback(async () => {
    if (!courseId || !assignmentId) return;
    await canvas.sync.assignmentDetail(courseId, assignmentId);
  }, [assignmentId, canvas.sync, courseId]);

  useAutoRefresh({
    enabled: enabled && Boolean(courseId && assignmentId) && (isMissing || isStale),
    refresh,
    refreshKey: syncScope,
  });

  return {
    assignment,
    data: assignment,
    isMissing,
    isRefreshing: isSyncRunning(canvas, syncScope),
    isStale,
    refresh,
    submission,
  };
}

export function useCourseModules(courseId: string | undefined, options: CanvasAutoSyncOptions = {}) {
  const canvas = useCanvasData();
  const enabled = options.enabled ?? true;
  const revalidateIfStale = options.revalidateIfStale ?? true;
  const staleMs = options.staleMs ?? DEFAULT_STALE_MS;
  const modules = courseId ? canvas.modules.listByCourse(courseId) : [];
  const moduleItems = courseId ? canvas.moduleItems.listByCourse(courseId) : [];
  const stamp = courseId ? canvas.snapshot.syncManifest[0]?.hydratedScopes.modules[courseId] : undefined;
  const isMissing = Boolean(courseId && modules.length === 0);
  const isStale = Boolean(courseId && revalidateIfStale && isScopeStale(stamp, staleMs));
  const isRefreshing = useMemo(
    () => canvas.snapshot.syncJobs.some((job) => job.status === "running" && job.scope === `modules:${courseId}`),
    [canvas.snapshot.syncJobs, courseId],
  );
  const refresh = useCallback(async () => {
    if (!courseId) return;
    await canvas.sync.courseModules(courseId);
  }, [canvas.sync, courseId]);

  useAutoRefresh({
    enabled: enabled && Boolean(courseId) && (isMissing || isStale),
    refresh,
    refreshKey: `modules:${courseId}`,
  });

  return {
    data: modules,
    isMissing,
    isRefreshing,
    isStale,
    moduleItems,
    modules,
    refresh,
  };
}

export function useModuleItemsByModule(
  courseId: string | undefined,
  moduleId: string | number | undefined,
  options: CanvasAutoSyncOptions = {},
) {
  const modulesResult = useCourseModules(courseId, options);
  const canvas = useCanvasData();
  const moduleItems = courseId && moduleId ? canvas.moduleItems.listByModule(courseId, moduleId) : [];

  return {
    ...modulesResult,
    data: moduleItems,
    moduleItems,
  };
}

export function useAssignmentGroupsByCourse(courseId: string | undefined, options: CanvasAutoSyncOptions = {}) {
  const courseAssignments = useCourseAssignments(courseId, options);
  const canvas = useCanvasData();
  const assignmentGroups = courseId ? canvas.assignmentGroups.listByCourse(courseId) : [];

  return {
    ...courseAssignments,
    assignmentGroups,
    data: assignmentGroups,
  };
}

export function useSubmissionsByCourse(courseId: string | undefined, options: CanvasAutoSyncOptions = {}) {
  const courseAssignments = useCourseAssignments(courseId, options);
  const canvas = useCanvasData();
  const submissions = courseId ? canvas.submissions.listByCourse(courseId) : [];

  return {
    ...courseAssignments,
    data: submissions,
    submissions,
  };
}

export function useEnrollmentsByCourse(courseId: string | undefined, options: CanvasAutoSyncOptions = {}) {
  const canvas = useCanvasData();
  const enrollments = courseId ? canvas.enrollments.listByCourse(courseId) : [];
  const refresh = useCallback(async () => {
    if (!courseId) return;
    await canvas.sync.bootstrap();
  }, [canvas.sync, courseId]);

  useAutoRefresh({
    enabled: (options.enabled ?? true) && Boolean(courseId) && enrollments.length === 0,
    refresh,
    refreshKey: `enrollments:${courseId}`,
  });

  return {
    data: enrollments,
    enrollments,
    isMissing: Boolean(courseId && enrollments.length === 0),
    isRefreshing: isSyncRunning(canvas, "bootstrap"),
    isStale: false,
    refresh,
  };
}

export function useTodos(options: CanvasAutoSyncOptions = {}) {
  const canvas = useCanvasData();
  const todos = canvas.todos.list();
  const enabled = options.enabled ?? true;
  const revalidateIfStale = options.revalidateIfStale ?? true;
  const staleMs = options.staleMs ?? DEFAULT_STALE_MS;
  const stamp = canvas.snapshot.syncManifest[0]?.hydratedScopes.dashboard;
  const isMissing = todos.length === 0;
  const isStale = revalidateIfStale && isScopeStale(stamp, staleMs);
  const refresh = useCallback(async () => {
    await canvas.sync.dashboard();
  }, [canvas.sync]);

  useAutoRefresh({
    enabled: enabled && (isMissing || isStale),
    refresh,
    refreshKey: "dashboard:todos",
  });

  return {
    data: todos,
    isMissing,
    isRefreshing: isSyncRunning(canvas, "dashboard"),
    isStale,
    refresh,
    todos,
  };
}

export function useCalendarEvents(options: CanvasAutoSyncOptions = {}) {
  const canvas = useCanvasData();
  const calendarEvents = canvas.calendarEvents.list();
  const enabled = options.enabled ?? true;
  const revalidateIfStale = options.revalidateIfStale ?? true;
  const staleMs = options.staleMs ?? DEFAULT_STALE_MS;
  const stamp = canvas.snapshot.syncManifest[0]?.hydratedScopes.dashboard;
  const isMissing = calendarEvents.length === 0;
  const isStale = revalidateIfStale && isScopeStale(stamp, staleMs);
  const refresh = useCallback(async () => {
    await canvas.sync.dashboard();
  }, [canvas.sync]);

  useAutoRefresh({
    enabled: enabled && (isMissing || isStale),
    refresh,
    refreshKey: "dashboard:calendar-events",
  });

  return {
    calendarEvents,
    data: calendarEvents,
    isMissing,
    isRefreshing: isSyncRunning(canvas, "dashboard"),
    isStale,
    refresh,
  };
}

export function useCanvasMutationQueue(operation?: string) {
  const canvas = useCanvasData();
  const mutations = useMemo(
    () => canvas.pendingMutations.filter((mutation) => !operation || mutation.operation === operation),
    [canvas.pendingMutations, operation],
  );

  return {
    clearAcked: canvas.mutations.clearAcked,
    flush: canvas.mutations.flush,
    mutations,
    queue: canvas.mutations.queue,
  };
}

export function useSubmitAssignment(courseId: string | undefined, assignmentId: string | number | undefined) {
  const mutationQueue = useCanvasMutationQueue("submissions.submit");
  const submit = useCallback(
    (params: CreateSubmissionParams) => {
      if (!courseId || !assignmentId) throw new Error("courseId and assignmentId are required to submit an assignment.");
      return mutationQueue.queue({
        namespace: "canvas",
        operation: "submissions.submit",
        payload: {
          assignmentId: String(assignmentId),
          courseId,
          params,
        },
      });
    },
    [assignmentId, courseId, mutationQueue],
  );

  return {
    ...mutationQueue,
    submit,
  };
}

export function useCreateDiscussionEntry(courseId: string | undefined, topicId: string | number | undefined) {
  const mutationQueue = useCanvasMutationQueue("discussions.createEntry");
  const createEntry = useCallback(
    (params: CreateDiscussionEntryParams) => {
      if (!courseId || !topicId) throw new Error("courseId and topicId are required to create a discussion entry.");
      return mutationQueue.queue({
        namespace: "canvas",
        operation: "discussions.createEntry",
        payload: {
          courseId,
          params,
          topicId: String(topicId),
        },
      });
    },
    [courseId, mutationQueue, topicId],
  );

  return {
    ...mutationQueue,
    createEntry,
  };
}

export function useCreateDiscussionReply(
  courseId: string | undefined,
  topicId: string | number | undefined,
  entryId: string | number | undefined,
) {
  const mutationQueue = useCanvasMutationQueue("discussions.createReply");
  const createReply = useCallback(
    (params: CreateDiscussionEntryParams) => {
      if (!courseId || !topicId || !entryId) {
        throw new Error("courseId, topicId, and entryId are required to create a discussion reply.");
      }
      return mutationQueue.queue({
        namespace: "canvas",
        operation: "discussions.createReply",
        payload: {
          courseId,
          entryId: String(entryId),
          params,
          topicId: String(topicId),
        },
      });
    },
    [courseId, entryId, mutationQueue, topicId],
  );

  return {
    ...mutationQueue,
    createReply,
  };
}

export const canvas = {
  users: {
    useSelf: useCurrentUser,
  },
  courses: {
    useGet: useCourse,
    useList: useCourses,
  },
  enrollments: {
    useListByCourse: useEnrollmentsByCourse,
  },
  assignments: {
    useGet: useAssignmentDetail,
    useListByCourse: useCourseAssignments,
  },
  assignmentGroups: {
    useListByCourse: useAssignmentGroupsByCourse,
  },
  submissions: {
    useListByCourse: useSubmissionsByCourse,
    useSubmit: useSubmitAssignment,
  },
  modules: {
    useListByCourse: useCourseModules,
  },
  moduleItems: {
    useListByModule: useModuleItemsByModule,
  },
  todos: {
    useList: useTodos,
  },
  calendarEvents: {
    useList: useCalendarEvents,
  },
  discussions: {
    useCreateEntry: useCreateDiscussionEntry,
    useCreateReply: useCreateDiscussionReply,
  },
  mutations: {
    useQueue: useCanvasMutationQueue,
  },
} as const;

function useAutoRefresh({
  enabled,
  refresh,
  refreshKey,
}: {
  enabled: boolean;
  refresh: () => Promise<void>;
  refreshKey: string;
}) {
  const lastRefreshKey = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;
    if (lastRefreshKey.current === refreshKey) return;
    lastRefreshKey.current = refreshKey;
    void refresh();
  }, [enabled, refresh, refreshKey]);
}

function isSyncRunning(canvas: ReturnType<typeof useCanvasData>, scope: string): boolean {
  return canvas.snapshot.syncJobs.some((job) => job.status === "running" && job.scope === scope);
}
