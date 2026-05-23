import { Badge } from "@canvas-v4/ui/components/badge";
import { Button } from "@canvas-v4/ui/components/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CircleCheck, CircleDashed } from "lucide-react";
import { canvas } from "@/lib/canvas";

export const Route = createFileRoute("/classes/$classId/assignments/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { classId } = Route.useParams();
	const { assignments } = canvas.assignments.useListByCourse(classId);
	return (
		<div className="p-8">
			<ul className="flex flex-col">
				{assignments.map((assignment) => (
					<Button
						key={assignment.id}
						variant="ghost"
						render={
							<Link
								to="/classes/$classId/assignments/$assignmentId"
								params={{ classId, assignmentId: assignment.id.toString() }}
							/>
						}
						className="h-10 justify-between rounded-md font-normal"
					>
						<div className="flex items-center gap-2">
							{assignment.has_submitted_submissions ? (
								<CircleCheck className="text-muted-foreground" />
							) : (
								<CircleDashed className="text-muted-foreground" />
							)}
							{assignment.name}
						</div>
						<div className="flex items-center gap-2 font-normal text-muted-foreground">
							{/*<Badge variant="outline">10 mins</Badge>*/}
							{new Date(assignment.due_at ?? "").toLocaleDateString(undefined, {
								month: "short",
								day: "numeric",
							})}
						</div>
					</Button>
				))}
			</ul>
		</div>
	);
}
