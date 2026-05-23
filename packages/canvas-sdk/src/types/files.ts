/**
 * Types for the Canvas Files API.
 *
 * @see https://canvas.instructure.com/doc/api/files.html
 * @module types/files
 */

import type { FileId, FolderId, ISO8601 } from "./common";

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

/**
 * A Canvas file object.
 */
export interface File {
  /** Unique numeric identifier. */
  id: FileId;
  /** UUID. */
  uuid: string;
  /** ID of the folder containing this file. */
  folder_id: FolderId;
  /** Human-readable display name. */
  display_name: string;
  /** Raw filename. */
  filename: string;
  /** MIME content type. */
  content_type: string;
  /**
   * Pre-authenticated download URL.
   * This URL expires after a short time and may require following a redirect.
   */
  url: string;
  /** File size in bytes. */
  size: number;
  /** ISO 8601 creation timestamp. */
  created_at: ISO8601;
  /** ISO 8601 last-modified timestamp. */
  updated_at: ISO8601;
  /** ISO 8601 date after which the file becomes available. */
  unlock_at?: ISO8601 | undefined;
  /** Whether the file is locked. */
  locked: boolean;
  /** Whether the file is hidden from students. */
  hidden: boolean;
  /** ISO 8601 date when the file locks. */
  lock_at?: ISO8601 | undefined;
  /** Whether the file is hidden for the current user. */
  hidden_for_user: boolean;
  /** Thumbnail URL (for image files). */
  thumbnail_url?: string | null | undefined;
  /** ISO 8601 last-modified timestamp. */
  modified_at: ISO8601;
  /**
   * MIME class used by Canvas for rendering (e.g. `"image"`, `"pdf"`, `"video"`).
   */
  mime_class: string;
  /** Kaltura media entry ID (for media files). */
  media_entry_id?: string | null | undefined;
  /** Whether the file is locked for the current user. */
  locked_for_user: boolean;
  /** Human-readable lock explanation. */
  lock_explanation?: string | undefined;
  /** Lock details. */
  lock_info?: unknown | undefined;
  /** Canvas document preview URL. */
  preview_url?: string | null | undefined;
}

/**
 * A Canvas folder for organising files.
 */
export interface Folder {
  /** Unique numeric identifier. */
  id: FolderId;
  /** Folder name. */
  name: string;
  /** Full path from the root folder. */
  full_name: string;
  /** ISO 8601 creation timestamp. */
  created_at: ISO8601;
  /** ISO 8601 last-updated timestamp. */
  updated_at: ISO8601;
  /** ISO 8601 date after which the folder becomes available. */
  unlock_at?: ISO8601 | undefined;
  /** ISO 8601 date when the folder locks. */
  lock_at?: ISO8601 | undefined;
  /** Position for ordering. */
  position: number | null;
  /** Whether the folder is locked. */
  locked: boolean;
  /** Whether the folder is locked for the current user. */
  locked_for_user: boolean;
  /** Whether the folder is hidden. */
  hidden: boolean;
  /** Whether the folder is hidden for the current user. */
  hidden_for_user: boolean;
  /** ID of the parent folder, or `null` for the root. */
  parent_folder_id: FolderId | null;
  /** Context type (e.g. `"Course"`, `"User"`). */
  context_type: string;
  /** ID of the owning context. */
  context_id: number;
  /** Number of files in this folder. */
  files_count: number;
  /** Number of sub-folders in this folder. */
  folders_count: number;
  /** API URL for listing files in this folder. */
  files_url: string;
  /** API URL for listing sub-folders. */
  folders_url: string;
  /** Whether this is the root folder. */
  is_root?: boolean | undefined;
  /** Whether this is the submissions folder. */
  for_submissions?: boolean | undefined;
  /** Whether this is a hidden user folder. */
  can_upload?: boolean | undefined;
}

/**
 * Response from the first step of the Canvas multi-step file upload process.
 */
export interface FileUploadTarget {
  /** The URL to `POST` the file to. */
  upload_url: string;
  /**
   * Additional form parameters that must be included in the upload POST.
   * Must be appended **before** the file field.
   */
  upload_params: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Request parameter types
// ---------------------------------------------------------------------------

/**
 * Parameters accepted by `GET /courses/:course_id/files`.
 */
export interface ListFilesParams {
  /**
   * Filter by MIME class.
   * Common values: `"image"`, `"pdf"`, `"doc"`, `"ppt"`, `"xls"`, `"zip"`, `"media"`
   */
  content_types?: string[] | undefined;
  /** Exclude specific MIME classes. */
  exclude_content_types?: string[] | undefined;
  /** Filter by search term (matches display_name). */
  search_term?: string | undefined;
  /**
   * Additional fields to include.
   * Common values: `"user"`, `"usage_rights"`
   */
  include?: string[] | undefined;
  /** Limit to a specific folder. */
  only?: ("names")[] | undefined;
  /** Sort field. */
  sort?:
    | "name"
    | "size"
    | "created_at"
    | "updated_at"
    | "content_type"
    | "user"
    | undefined;
  /** Sort direction. */
  order?: "asc" | "desc" | undefined;
  /** Number of results per page. */
  per_page?: number | undefined;
}

/**
 * Parameters for the first step of a Canvas file upload
 * (`POST /courses/:course_id/files`).
 */
export interface InitiateFileUploadParams {
  /** Filename for the uploaded file (required). */
  name: string;
  /** File size in bytes (required). */
  size: number;
  /** MIME type. Defaults to `"application/octet-stream"`. */
  content_type?: string | undefined;
  /** What to do if a file with the same name already exists. */
  on_duplicate?: "rename" | "overwrite" | undefined;
  /** Folder path to upload into (e.g. `"unfiled"`). */
  parent_folder_path?: string | undefined;
  /** Folder ID to upload into. */
  parent_folder_id?: FolderId | undefined;
}
