import type { CanvasCollectionName } from "@canvas-v4/canvas-sync";
import { canvasCollectionNames, collectionCount } from "@canvas-v4/canvas-sync";
import { Button } from "@canvas-v4/ui/components/button";
import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  AlertCircle,
  Boxes,
  Database,
  Download,
  Play,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { getUser } from "@/functions/get-user";
import { useCanvasDebugSnapshot } from "@/lib/canvas/use-debug-snapshot";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({
        to: "/login",
      });
    }
  },
});

function RouteComponent() {
  const {
    activeCourses,
    clearCache,
    exportSnapshot,
    hydrated,
    isPending,
    pendingMutations,
    runSync,
    selectedCourseId,
    setSelectedCourseId,
    snapshot,
  } = useCanvasDebugSnapshot();
  const [activeCollection, setActiveCollection] = useState<CanvasCollectionName>("courses");
  const [manualCourseId, setManualCourseId] = useState("");
  const [query, setQuery] = useState("");
  const rows = snapshot[activeCollection] as unknown[];
  const filteredRows = useMemo(() => filterRows(rows, query), [query, rows]);
  const selectedCourse = selectedCourseId || activeCourses[0]?.sync.canvasId || "";
  const courseIdToSync = manualCourseId.trim() || selectedCourse;
  const latestError = snapshot.syncErrors[0];

  return (
    <main className="min-h-0 overflow-auto bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-5 py-5">
        <header className="flex flex-wrap items-center justify-between gap-3 border-border border-b pb-4">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Database className="size-4" />
              Canvas Sync Debug
            </div>
            <h1 className="font-semibold text-2xl tracking-normal">Local data inspector</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void runSync("bootstrap")}
              disabled={isPending}
            >
              <Play className="size-4" />
              Bootstrap
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void runSync("dashboard")}
              disabled={isPending}
            >
              <RefreshCw className="size-4" />
              Dashboard
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={exportSnapshot}>
              <Download className="size-4" />
              Export
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={() => void clearCache()}>
              <Trash2 className="size-4" />
              Clear
            </Button>
          </div>
        </header>

        {latestError ? (
          <section className="flex items-start gap-3 border border-destructive/40 bg-destructive/10 p-3 text-sm">
            <AlertCircle className="mt-0.5 size-4 text-destructive" />
            <div>
              <div className="font-medium">{latestError.scope}</div>
              <div className="text-muted-foreground">{latestError.message}</div>
            </div>
          </section>
        ) : null}

        <section className="grid gap-3 md:grid-cols-4">
          <Metric label="Hydration" value={hydrated ? "Ready" : "Loading"} />
          <Metric label="Courses" value={snapshot.courses.length.toString()} />
          <Metric label="Assignments" value={snapshot.assignments.length.toString()} />
          <Metric label="Mutations" value={pendingMutations.length.toString()} />
        </section>

        <section className="grid min-h-[680px] gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="flex min-h-0 flex-col gap-4 border-border border-r pr-4">
            <div className="flex items-center gap-2 font-medium text-sm">
              <Boxes className="size-4" />
              Collections
            </div>
            <div className="grid gap-1">
              {canvasCollectionNames.map((name) => (
                <button
                  type="button"
                  key={name}
                  className={`flex h-9 items-center justify-between border px-3 text-left text-sm ${
                    activeCollection === name
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-transparent hover:border-border hover:bg-muted"
                  }`}
                  onClick={() => setActiveCollection(name)}
                >
                  <span className="truncate">{name}</span>
                  <span className="font-mono text-xs">{collectionCount(snapshot, name)}</span>
                </button>
              ))}
            </div>

            <div className="mt-2 grid gap-2">
              <label className="font-medium text-sm" htmlFor="course-select">
                Course sync
              </label>
              <select
                id="course-select"
                className="h-9 border border-input bg-background px-2 text-sm"
                value={selectedCourse}
                onChange={(event) => {
                  setSelectedCourseId(event.target.value);
                  setManualCourseId("");
                }}
              >
                {activeCourses.length === 0 ? <option value="">No courses loaded</option> : null}
                {activeCourses.map((course) => (
                  <option key={course.sync.id} value={course.sync.canvasId}>
                    {String(course.name ?? course.course_code ?? course.sync.canvasId)}
                  </option>
                ))}
              </select>
              <input
                className="h-9 border border-input bg-background px-2 text-sm"
                inputMode="numeric"
                onChange={(event) => setManualCourseId(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && courseIdToSync && !isPending) {
                    void runSync("course", courseIdToSync);
                  }
                }}
                placeholder="Or enter course ID"
                value={manualCourseId}
              />
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void runSync("course", courseIdToSync)}
                  disabled={!courseIdToSync || isPending}
                >
                  Basics
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void runSync("modules", courseIdToSync)}
                  disabled={!courseIdToSync || isPending}
                >
                  Modules
                </Button>
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-xl">{activeCollection}</h2>
                <p className="text-muted-foreground text-sm">
                  {filteredRows.length} of {rows.length} records
                </p>
              </div>
              <label className="relative block w-full max-w-sm">
                <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
                <input
                  className="h-10 w-full border border-input bg-background pr-3 pl-9 text-sm"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search JSON"
                />
              </label>
            </div>
            <DataTable rows={filteredRows} collection={activeCollection} />
          </section>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border p-3">
      <div className="text-muted-foreground text-xs uppercase">{label}</div>
      <div className="mt-1 truncate font-semibold text-lg">{value}</div>
    </div>
  );
}

function DataTable({
  rows,
  collection,
}: {
  rows: unknown[];
  collection: CanvasCollectionName;
}) {
  const previewRows = rows.slice(0, 250);
  const columns = useMemo(() => getColumns(previewRows), [previewRows]);

  if (rows.length === 0) {
    return (
      <div className="grid min-h-80 place-items-center border border-border text-muted-foreground text-sm">
        No records in {collection}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="overflow-auto border border-border">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="sticky top-0 bg-muted">
            <tr>
              {columns.map((column) => (
                <th key={column} className="border-border border-b px-3 py-2 text-left font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, index) => (
              <tr key={rowKey(row, index)} className="border-border border-b align-top hover:bg-muted/50">
                {columns.map((column) => (
                  <td key={column} className="max-w-[280px] truncate px-3 py-2 font-mono text-xs">
                    {cellValue(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <details className="border border-border">
        <summary className="cursor-pointer px-3 py-2 font-medium text-sm">Raw JSON</summary>
        <pre className="max-h-[520px] overflow-auto border-border border-t p-3 text-xs">
          {JSON.stringify(previewRows, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function filterRows(rows: unknown[], query: string): unknown[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return rows;
  return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(trimmed));
}

function getColumns(rows: unknown[]): string[] {
  const columns = new Set<string>(["sync.id", "id", "name", "title", "workflow_state", "updated_at", "sync.fetchedAt"]);
  for (const row of rows.slice(0, 20)) {
    if (!row || typeof row !== "object") continue;
    for (const key of Object.keys(row).slice(0, 12)) {
      if (key !== "sync") columns.add(key);
    }
  }
  return [...columns].slice(0, 12);
}

function rowKey(row: unknown, index: number): string {
  if (!row || typeof row !== "object") return String(index);
  const item = row as { sync?: { id?: string }; id?: string | number };
  return item.sync?.id ?? String(item.id ?? index);
}

function cellValue(row: unknown, column: string): string {
  const value = readPath(row, column);
  if (value === undefined || value === null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function readPath(row: unknown, path: string): unknown {
  if (!row || typeof row !== "object") return undefined;
  return path.split(".").reduce<unknown>((value, key) => {
    if (!value || typeof value !== "object") return undefined;
    return (value as Record<string, unknown>)[key];
  }, row);
}
