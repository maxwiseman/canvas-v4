/**
 * @maxw-ai/canvas — A type-safe Canvas LMS REST API SDK.
 *
 * ## Quick-start
 *
 * ```ts
 * import { CanvasClient } from "@maxw-ai/canvas";
 *
 * const canvas = new CanvasClient({
 *   token: process.env.CANVAS_API_TOKEN!,
 *   domain: "school.instructure.com",
 * });
 *
 * // List all active courses
 * for await (const course of canvas.courses.list()) {
 *   console.log(course.name);
 * }
 *
 * // Get the current user's to-do list
 * const todos = await canvas.users.todoItems();
 *
 * // Fetch upcoming assignments across all courses
 * const courses = await canvas.courses.list().all();
 * const allUpcoming = await Promise.all(
 *   courses.map(c =>
 *     canvas.courses.assignments(c.id).list({ bucket: "upcoming" }).all()
 *   )
 * );
 * ```
 *
 * @module @maxw-ai/canvas
 */

// ---------------------------------------------------------------------------
// Main client
// ---------------------------------------------------------------------------

export { CanvasClient } from "./client";
export type { CanvasClientOptions } from "./client";

// ---------------------------------------------------------------------------
// HTTP / pagination primitives (useful for advanced use-cases)
// ---------------------------------------------------------------------------

export { CanvasPagedList } from "./http";
export type { PageResult, HttpClientOptions, ListParams } from "./http";

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

export {
  CanvasError,
  CanvasAPIError,
  CanvasAuthenticationError,
  CanvasPermissionError,
  CanvasNotFoundError,
  CanvasConflictError,
  CanvasRateLimitError,
  CanvasServerError,
  CanvasNetworkError,
} from "./errors";
export type { CanvasErrorBody, CanvasErrorObject } from "./errors";

// ---------------------------------------------------------------------------
// Resource classes (exported for isinstance checks and extension)
// ---------------------------------------------------------------------------

export { CoursesResource } from "./resources/courses";
export { AssignmentsResource } from "./resources/assignments";
export { SubmissionsResource } from "./resources/submissions";
export { EnrollmentsResource } from "./resources/enrollments";
export { ModulesResource } from "./resources/modules";
export { PagesResource } from "./resources/pages";
export { FilesResource } from "./resources/files";
export { DiscussionsResource } from "./resources/discussions";
export { QuizzesResource } from "./resources/quizzes";
export { AnnouncementsResource } from "./resources/announcements";
export { UsersResource } from "./resources/users";
export { CalendarEventsResource } from "./resources/calendar-events";

// ---------------------------------------------------------------------------
// All types
// ---------------------------------------------------------------------------

export type {
  // Common / shared
  CourseId,
  AssignmentId,
  UserId,
  EnrollmentId,
  SubmissionId,
  ModuleId,
  ModuleItemId,
  PageId,
  FileId,
  FolderId,
  DiscussionTopicId,
  DiscussionEntryId,
  QuizId,
  QuizSubmissionId,
  CalendarEventId,
  ConversationId,
  SectionId,
  GroupId,
  RubricId,
  ISO8601,
  LockInfo,
  RubricRating,
  RubricCriterion,
  RubricSettings,
  RubricAssessment,
  Term,
  GradingPeriod,
  ExternalToolTagAttributes,
  // Courses
  Course,
  CourseWorkflowState,
  CourseDefaultView,
  CourseLicense,
  CourseProgress,
  CourseTeacher,
  CourseSettings,
  BlueprintRestrictions,
  GradingStandard,
  AssignmentGroup,
  ListCoursesParams,
  GetCourseParams,
  UpdateCourseParams,
  CreateCourseParams,
  // Assignments
  Assignment,
  GradingType,
  SubmissionType,
  AssignmentDate,
  AssignmentOverride,
  NeedsGradingCountBySection,
  ScoreStatistics,
  TurnitinSettings,
  ListAssignmentsParams,
  GetAssignmentParams,
  CreateAssignmentParams,
  UpdateAssignmentParams,
  // Submissions
  Submission,
  SubmissionWorkflowState,
  SubmissionComment,
  SubmissionAttachment,
  MediaComment,
  ListSubmissionsParams,
  ListStudentSubmissionsParams,
  CreateSubmissionParams,
  GradeSubmissionParams,
  // Users
  User,
  UserProfile,
  UserDisplay,
  ActivityStreamItem,
  TodoItem,
  ListUsersParams,
  GetUserParams,
  // Enrollments
  Enrollment,
  EnrollmentType,
  EnrollmentState,
  Grades,
  ListEnrollmentsParams,
  EnrollUserParams,
  // Modules
  Module,
  ModuleItem,
  ModuleState,
  ModuleItemType,
  CompletionRequirementType,
  CompletionRequirement,
  ModuleItemContentDetails,
  ListModulesParams,
  ListModuleItemsParams,
  CreateModuleParams,
  UpdateModuleParams,
  // Pages
  Page,
  PageEditingRole,
  ListPagesParams,
  GetPageParams,
  UpdatePageParams,
  CreatePageParams,
  // Files
  File,
  Folder,
  FileUploadTarget,
  ListFilesParams,
  InitiateFileUploadParams,
  // Discussions
  DiscussionTopic,
  DiscussionEntry,
  DiscussionView,
  DiscussionParticipant,
  DiscussionPermissions,
  ListDiscussionTopicsParams,
  CreateDiscussionTopicParams,
  CreateDiscussionEntryParams,
  // Quizzes
  Quiz,
  QuizQuestion,
  QuizAnswer,
  QuizSubmission,
  QuizType,
  QuizScoringPolicy,
  QuizSubmissionWorkflowState,
  ListQuizzesParams,
  CreateQuizParams,
  UpdateQuizParams,
  // Announcements
  Announcement,
  ListAnnouncementsParams,
  CreateAnnouncementParams,
  // Calendar events
  CalendarEvent,
  CalendarEventWorkflowState,
  CalendarEventContextType,
  CalendarEventReservation,
  ListCalendarEventsParams,
  CreateCalendarEventParams,
  UpdateCalendarEventParams,
} from "./types/index";
