import { createFileRoute, Link } from "@tanstack/react-router";
import { canvas } from "@/lib/canvas";

export const Route = createFileRoute("/classes/$classId/")({
	component: RouteComponent,
});

function RouteComponent() {
	const classId = Route.useParams().classId;
	const {
		course,
		error: courseError,
		hasAttemptedLoad,
		isRefreshing: isCourseRefreshing,
	} =
		canvas.courses.useGet(classId);
	const { modules, isRefreshing: areModulesRefreshing } =
		canvas.modules.useListByCourse(classId, { enabled: Boolean(course) });
	const { assignments } = canvas.assignments.useListByCourse(classId, {
		enabled: Boolean(course),
	});

	if (!course) {
		if (isCourseRefreshing || !hasAttemptedLoad) {
			return <div>Loading course...</div>;
		}

		return (
			<div>
				<h1>Course not found</h1>
				{courseError ? (
					<p className="text-muted-foreground">{courseError.message}</p>
				) : null}
			</div>
		);
	}

	return (
		<div>
			<h1>{course.name}</h1>
			{areModulesRefreshing ? <p>Refreshing modules...</p> : null}
			<ul>
				{modules.map((module) => (
					<li key={module.sync.id}>
						<h2>{module.name}</h2>
						<div>
							{module.items?.map((item) => (
								<div className="text-muted-foreground" key={item.id}>
									{item.title}
								</div>
							))}
						</div>
					</li>
				))}
			</ul>
			<ul>
				{assignments.map((assignment) => (
					<li key={assignment.sync.id}>
						<Link
							to="/classes/$classId/assignments/$assignmentId"
							params={{ classId, assignmentId: assignment.id.toString() }}
						>
							{assignment.name}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
