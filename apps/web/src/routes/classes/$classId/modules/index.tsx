import { createFileRoute } from "@tanstack/react-router";
import { canvas } from "@/lib/canvas";

export const Route = createFileRoute("/classes/$classId/modules/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { classId } = Route.useParams();
	const { modules } = canvas.modules.useListByCourse(classId);
	return (
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
	);
}
