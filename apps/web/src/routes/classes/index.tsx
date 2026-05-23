import { canvas } from "@/lib/canvas";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/classes/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { courses, isRefreshing } = canvas.courses.useList();

  return (
    <div>
      <h1>Classes</h1>
      {isRefreshing ? <p>Refreshing classes...</p> : null}
      {courses.map((course) => (
        <Link key={course.sync.id} to="/classes/$classId" params={{ classId: course.sync.canvasId }}>
          {course.name}
        </Link>
      ))}
    </div>
  );
}
