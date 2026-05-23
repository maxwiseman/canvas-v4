import { createFileRoute } from "@tanstack/react-router";
import { canvas } from "@/lib/canvas";

export const Route = createFileRoute(
	"/classes/$classId/assignments/$assignmentId/",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { classId, assignmentId } = Route.useParams();
	const { assignment, isRefreshing } = canvas.assignments.useGet(
		classId,
		assignmentId,
	);

	if (!assignment) {
		return (
			<div>
				{isRefreshing ? "Loading assignment..." : "Assignment not found"}
			</div>
		);
	}

	return (
		<div className="p-8">
			<h1 className="font-semibold text-2xl">{assignment.name}</h1>
			<p className="flex gap-2 text-muted-foreground">
				<div>
					{new Date(assignment.due_at ?? "").toLocaleString(undefined, {
						dateStyle: "medium",
						timeStyle: "short",
					})}
				</div>
				<div>·</div>
				<div>{`${assignment.points_possible} point${assignment.points_possible === 1 ? "" : "s"}`}</div>
			</p>
			<div
				className="mt-8"
				dangerouslySetInnerHTML={{ __html: assignment.description ?? "" }}
			/>
		</div>
	);
}
