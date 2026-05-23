/**
 * Resource class for the Canvas Files API.
 *
 * @module resources/files
 */

import type { CanvasHttpClient, CanvasPagedList } from "../http";
import type {
  CourseId,
  File,
  FileId,
  FileUploadTarget,
  Folder,
  FolderId,
  InitiateFileUploadParams,
  ListFilesParams,
} from "../types/index";

/**
 * Provides access to files and folders within a course (or globally).
 *
 * Obtain a course-scoped instance via `canvas.courses.files(courseId)`.
 * Obtain a global instance via `canvas.files`.
 *
 * ### Multi-step file upload
 *
 * Canvas uses a three-step upload process:
 * 1. {@link initiate} — request a pre-signed upload URL.
 * 2. Upload the file bytes directly to the returned `upload_url`.
 * 3. {@link confirmUpload} — confirm the upload with Canvas.
 *
 * @example Upload a file to a course
 * ```ts
 * const files = canvas.courses.files(courseId);
 *
 * // Step 1 — initiate
 * const target = await files.initiate({
 *   name: "report.pdf",
 *   size: buffer.byteLength,
 *   content_type: "application/pdf",
 * });
 *
 * // Step 2 — upload to S3 / CDN
 * const form = new FormData();
 * for (const [k, v] of Object.entries(target.upload_params)) {
 *   form.append(k, v);
 * }
 * form.append("file", blob);
 * const uploadRes = await fetch(target.upload_url, { method: "POST", body: form });
 *
 * // Step 3 — confirm
 * const file = await files.confirmUpload(uploadRes.headers.get("location")!);
 * console.log("Uploaded:", file.id, file.display_name);
 * ```
 */
export class FilesResource {
  readonly #http: CanvasHttpClient;
  readonly #courseId: CourseId | number | undefined;

  /**
   * @internal
   * @param http - HTTP client.
   * @param courseId - Optional course scope. When omitted the resource operates
   *   at the user level.
   */
  constructor(http: CanvasHttpClient, courseId?: CourseId | number) {
    this.#http = http;
    this.#courseId = courseId;
  }

  // ---------------------------------------------------------------------------
  // Files
  // ---------------------------------------------------------------------------

  /**
   * Returns a paginated list of files in the course (or the current user's files
   * if no course was specified).
   *
   * @param params - Optional filters.
   *
   * @example
   * ```ts
   * const pdfs = await files.list({ content_types: ["application/pdf"] }).all();
   * ```
   */
  list(params?: ListFilesParams): CanvasPagedList<File> {
    const path = this.#courseId
      ? `/courses/${this.#courseId}/files`
      : "/users/self/files";
    return this.#http.getList<File>(path, params as Record<string, unknown>);
  }

  /**
   * Returns a single file by ID.
   *
   * @param fileId - Numeric Canvas file ID.
   *
   * @example
   * ```ts
   * const file = await files.retrieve(fileId);
   * console.log(file.url); // pre-authenticated download URL
   * ```
   */
  retrieve(fileId: FileId | number): Promise<File> {
    return this.#http.get<File>(`/files/${fileId}`);
  }

  /**
   * Deletes a file.
   *
   * @param fileId - Numeric Canvas file ID.
   * @param replace - If `true`, the file is replaced by a placeholder.
   */
  delete(fileId: FileId | number, replace = false): Promise<File> {
    return this.#http.delete<File>(
      `/files/${fileId}${replace ? "?replace=true" : ""}`,
    );
  }

  // ---------------------------------------------------------------------------
  // File upload (three-step process)
  // ---------------------------------------------------------------------------

  /**
   * **Step 1** — Initiates a file upload and returns the upload target.
   *
   * @param params - Upload parameters including filename and size.
   */
  initiate(params: InitiateFileUploadParams): Promise<FileUploadTarget> {
    const path = this.#courseId
      ? `/courses/${this.#courseId}/files`
      : "/users/self/files";
    return this.#http.post<FileUploadTarget>(path, params);
  }

  /**
   * **Step 3** — Confirms a completed file upload by POSTing to the location
   * URL returned after the direct upload.
   *
   * @param locationUrl - The `Location` header value from the upload response.
   */
  async confirmUpload(locationUrl: string): Promise<File> {
    return this.#http.post<File>(locationUrl);
  }

  // ---------------------------------------------------------------------------
  // Folders
  // ---------------------------------------------------------------------------

  /**
   * Returns a paginated list of folders in the course.
   *
   * @example
   * ```ts
   * for await (const folder of files.listFolders()) {
   *   console.log(folder.full_name);
   * }
   * ```
   */
  listFolders(): CanvasPagedList<Folder> {
    const path = this.#courseId
      ? `/courses/${this.#courseId}/folders`
      : "/users/self/folders";
    return this.#http.getList<Folder>(path);
  }

  /**
   * Returns a single folder by ID.
   *
   * @param folderId - Numeric Canvas folder ID.
   */
  retrieveFolder(folderId: FolderId | number): Promise<Folder> {
    return this.#http.get<Folder>(`/folders/${folderId}`);
  }

  /**
   * Returns the files within a folder.
   *
   * @param folderId - Numeric Canvas folder ID.
   * @param params - Optional filters.
   */
  listFolderFiles(
    folderId: FolderId | number,
    params?: ListFilesParams,
  ): CanvasPagedList<File> {
    return this.#http.getList<File>(
      `/folders/${folderId}/files`,
      params as Record<string, unknown>,
    );
  }
}
