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

export type CanvasSyncSource = "app" | "canvas";
export type CanvasSyncPriority = "visible" | "background" | "idle";

export interface CanvasEntityMeta {
	id: string;
	canvasId: string;
	fetchedAt: string;
	source: CanvasSyncSource;
	courseId?: string;
	shapes?: Record<string, string>;
}

export type CanvasEntity<T extends object> = T & {
	sync: CanvasEntityMeta;
};

export type CanvasUser = CanvasEntity<User | UserProfile>;
export type CanvasCourse = CanvasEntity<Course>;
export type CanvasEnrollment = CanvasEntity<Enrollment>;
export type CanvasAssignment = CanvasEntity<Assignment>;
export type CanvasSubmission = CanvasEntity<Submission>;
export type CanvasAssignmentGroup = CanvasEntity<AssignmentGroup>;
export type CanvasModule = CanvasEntity<Module>;
export type CanvasModuleItem = CanvasEntity<ModuleItem>;
export type CanvasPage = CanvasEntity<Page>;
export type CanvasAnnouncement = CanvasEntity<Announcement>;
export type CanvasCalendarEvent = CanvasEntity<CalendarEvent>;
export type CanvasTodo = CanvasEntity<TodoItem>;

export interface CanvasCourseOverlay {
	id: string;
	userId: string;
	canvasCourseId: string;
	icon: string | null;
	createdAt: string;
	updatedAt: string;
	sync: CanvasEntityMeta & {
		source: "app";
		courseId: string;
	};
}

export interface CanvasSyncError {
	id: string;
	scope: string;
	message: string;
	status?: number;
	retryAfterMs?: number;
	occurredAt: string;
}

export interface CanvasEnvelope {
	users?: CanvasUser[];
	courses?: CanvasCourse[];
	enrollments?: CanvasEnrollment[];
	assignments?: CanvasAssignment[];
	submissions?: CanvasSubmission[];
	assignmentGroups?: CanvasAssignmentGroup[];
	modules?: CanvasModule[];
	moduleItems?: CanvasModuleItem[];
	pages?: CanvasPage[];
	announcements?: CanvasAnnouncement[];
	calendarEvents?: CanvasCalendarEvent[];
	canvasTodos?: CanvasTodo[];
	courseOverlays?: CanvasCourseOverlay[];
	syncMeta: {
		scope: string;
		fetchedAt: string;
		source: CanvasSyncSource;
		errors?: CanvasSyncError[];
	};
}

export type CanvasCollectionName =
	| "users"
	| "courses"
	| "enrollments"
	| "assignments"
	| "submissions"
	| "assignmentGroups"
	| "modules"
	| "moduleItems"
	| "pages"
	| "announcements"
	| "calendarEvents"
	| "canvasTodos"
	| "courseOverlays"
	| "syncJobs"
	| "syncErrors"
	| "syncManifest";

export interface SyncStamp {
	fetchedAt: string;
	source: CanvasSyncSource;
	errorCount?: number;
}

export interface SyncManifest {
	id: "manifest";
	userId?: string;
	activeCourseIds: string[];
	hydratedScopes: {
		dashboard?: SyncStamp;
		courseAssignments: Record<string, SyncStamp>;
		assignmentDetails: Record<string, SyncStamp>;
		submissions: Record<string, SyncStamp>;
		modules: Record<string, SyncStamp>;
		announcements: Record<string, SyncStamp>;
	};
	updatedAt: string;
}

export interface CanvasSyncJob {
	id: string;
	scope: string;
	priority: CanvasSyncPriority;
	status: "queued" | "running" | "success" | "error";
	startedAt?: string;
	finishedAt?: string;
	message?: string;
}

export interface CanvasDebugSnapshot {
	users: CanvasUser[];
	courses: CanvasCourse[];
	enrollments: CanvasEnrollment[];
	assignments: CanvasAssignment[];
	submissions: CanvasSubmission[];
	assignmentGroups: CanvasAssignmentGroup[];
	modules: CanvasModule[];
	moduleItems: CanvasModuleItem[];
	pages: CanvasPage[];
	announcements: CanvasAnnouncement[];
	calendarEvents: CanvasCalendarEvent[];
	canvasTodos: CanvasTodo[];
	courseOverlays: CanvasCourseOverlay[];
	syncJobs: CanvasSyncJob[];
	syncErrors: CanvasSyncError[];
	syncManifest: SyncManifest[];
}

export type CanvasEntityCollectionName = Exclude<
	CanvasCollectionName,
	"syncJobs" | "syncErrors" | "syncManifest"
>;

export type CanvasEntityByCollection = {
	users: CanvasUser;
	courses: CanvasCourse;
	enrollments: CanvasEnrollment;
	assignments: CanvasAssignment;
	submissions: CanvasSubmission;
	assignmentGroups: CanvasAssignmentGroup;
	modules: CanvasModule;
	moduleItems: CanvasModuleItem;
	pages: CanvasPage;
	announcements: CanvasAnnouncement;
	calendarEvents: CanvasCalendarEvent;
	canvasTodos: CanvasTodo;
	courseOverlays: CanvasCourseOverlay;
};

export const canvasEntityCollectionNames: CanvasEntityCollectionName[] = [
	"users",
	"courses",
	"enrollments",
	"assignments",
	"submissions",
	"assignmentGroups",
	"modules",
	"moduleItems",
	"pages",
	"announcements",
	"calendarEvents",
	"canvasTodos",
	"courseOverlays",
];

export const canvasCollectionNames: CanvasCollectionName[] = [
	...canvasEntityCollectionNames,
	"syncJobs",
	"syncErrors",
	"syncManifest",
];
