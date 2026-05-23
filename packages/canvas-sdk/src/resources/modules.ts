/**
 * Resource class for the Canvas Modules API.
 *
 * @module resources/modules
 */

import type { CanvasHttpClient, CanvasPagedList } from "../http";
import type {
  CourseId,
  CreateModuleParams,
  ListModuleItemsParams,
  ListModulesParams,
  Module,
  ModuleId,
  ModuleItem,
  ModuleItemId,
  UpdateModuleParams,
} from "../types/index";

/**
 * Provides access to modules within a course.
 *
 * Obtain an instance via `canvas.courses.modules(courseId)`.
 *
 * @example
 * ```ts
 * const modules = canvas.courses.modules(12345);
 *
 * // List all modules with items
 * for await (const mod of modules.list({ include: ["items", "content_details"] })) {
 *   console.log(mod.name);
 *   for (const item of mod.items ?? []) {
 *     console.log("  -", item.title, item.type);
 *   }
 * }
 * ```
 */
export class ModulesResource {
  readonly #http: CanvasHttpClient;
  readonly #courseId: CourseId | number;

  /** @internal */
  constructor(http: CanvasHttpClient, courseId: CourseId | number) {
    this.#http = http;
    this.#courseId = courseId;
  }

  // ---------------------------------------------------------------------------
  // Modules
  // ---------------------------------------------------------------------------

  /**
   * Returns a paginated list of modules for the course.
   *
   * @param params - Optional filters and includes.
   *
   * @example
   * ```ts
   * for await (const mod of modules.list({ include: ["items"] })) {
   *   console.log(mod.name, mod.items?.length, "items");
   * }
   * ```
   */
  list(params?: ListModulesParams): CanvasPagedList<Module> {
    return this.#http.getList<Module>(
      `/courses/${this.#courseId}/modules`,
      params as Record<string, unknown>,
    );
  }

  /**
   * Returns a single module by ID.
   *
   * @param moduleId - Numeric Canvas module ID.
   * @param params - Optional includes.
   */
  retrieve(moduleId: ModuleId | number, params?: ListModulesParams): Promise<Module> {
    return this.#http.get<Module>(
      `/courses/${this.#courseId}/modules/${moduleId}`,
      params as Record<string, unknown>,
    );
  }

  /**
   * Creates a new module.
   *
   * @param params - Module creation parameters.
   *
   * @example
   * ```ts
   * const mod = await modules.create({
   *   module: { name: "Week 1: Introduction", published: true },
   * });
   * ```
   */
  create(params: CreateModuleParams): Promise<Module> {
    return this.#http.post<Module>(`/courses/${this.#courseId}/modules`, params);
  }

  /**
   * Updates a module.
   *
   * @param moduleId - Numeric Canvas module ID.
   * @param params - Fields to update.
   */
  update(moduleId: ModuleId | number, params: UpdateModuleParams): Promise<Module> {
    return this.#http.put<Module>(
      `/courses/${this.#courseId}/modules/${moduleId}`,
      params,
    );
  }

  /**
   * Deletes a module.
   *
   * @param moduleId - Numeric Canvas module ID.
   */
  delete(moduleId: ModuleId | number): Promise<Module> {
    return this.#http.delete<Module>(
      `/courses/${this.#courseId}/modules/${moduleId}`,
    );
  }

  // ---------------------------------------------------------------------------
  // Module items
  // ---------------------------------------------------------------------------

  /**
   * Returns a paginated list of items within a module.
   *
   * @param moduleId - Numeric Canvas module ID.
   * @param params - Optional filters and includes.
   *
   * @example
   * ```ts
   * const items = await modules.listItems(modId, {
   *   include: ["content_details"],
   * }).all();
   * ```
   */
  listItems(
    moduleId: ModuleId | number,
    params?: ListModuleItemsParams,
  ): CanvasPagedList<ModuleItem> {
    return this.#http.getList<ModuleItem>(
      `/courses/${this.#courseId}/modules/${moduleId}/items`,
      params as Record<string, unknown>,
    );
  }

  /**
   * Returns a single module item.
   *
   * @param moduleId - Numeric Canvas module ID.
   * @param itemId - Numeric Canvas module item ID.
   * @param params - Optional includes.
   */
  retrieveItem(
    moduleId: ModuleId | number,
    itemId: ModuleItemId | number,
    params?: ListModuleItemsParams,
  ): Promise<ModuleItem> {
    return this.#http.get<ModuleItem>(
      `/courses/${this.#courseId}/modules/${moduleId}/items/${itemId}`,
      params as Record<string, unknown>,
    );
  }

  /**
   * Marks a module item as done for the current user
   * (fulfils `must_mark_done` completion requirements).
   *
   * @param moduleId - Numeric Canvas module ID.
   * @param itemId - Numeric Canvas module item ID.
   */
  markItemDone(
    moduleId: ModuleId | number,
    itemId: ModuleItemId | number,
  ): Promise<void> {
    return this.#http.put<void>(
      `/courses/${this.#courseId}/modules/${moduleId}/items/${itemId}/done`,
    );
  }

  /**
   * Unmarks a module item as done.
   *
   * @param moduleId - Numeric Canvas module ID.
   * @param itemId - Numeric Canvas module item ID.
   */
  unmarkItemDone(
    moduleId: ModuleId | number,
    itemId: ModuleItemId | number,
  ): Promise<void> {
    return this.#http.delete<void>(
      `/courses/${this.#courseId}/modules/${moduleId}/items/${itemId}/done`,
    );
  }
}
