import { createFileRoute, Link } from "@tanstack/react-router";
import { canvas } from "@/lib/canvas";

export const Route = createFileRoute("/classes/$classId/assignments/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { classId } = Route.useParams();
	const { assignments } = canvas.assignments.useListByCourse(classId);
	return (
		<ul>
			{assignments.map((assignment) => (
				<li key={assignment.id}>
					<Link
						to="/classes/$classId/assignments/$assignmentId"
						params={{ classId, assignmentId: assignment.id.toString() }}
					>
						{assignment.name}
					</Link>
				</li>
			))}
		</ul>
	);
}
