import { createFileRoute } from "@tanstack/react-router";
import { canvas } from "@/lib/canvas";

export const Route = createFileRoute("/classes/$classId/announcements/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { classId } = Route.useParams();
	const { announcements, isRefreshing } =
		canvas.announcements.useListByCourse(classId);

	if (isRefreshing && announcements.length === 0) {
		return (
			<div>
				Loading announcements...
			</div>
		);
	}

	return (
		<div>
			{announcements.length === 0 ? (
				<p className="text-muted-foreground">No announcements found.</p>
			) : null}
			{announcements.map((announcement) => (
				<div key={announcement.id}>
					<h2>{announcement.title}</h2>
					{announcement.message ? (
						<div dangerouslySetInnerHTML={{ __html: announcement.message }} />
					) : null}
				</div>
			))}
		</div>
	);
}
