import { SidebarMenuButton } from "@canvas-v4/ui/components/sidebar";
import { Link, useParams } from "@tanstack/react-router";
import {
	Blocks,
	ChevronLeft,
	LayoutGrid,
	LayoutList,
	LayoutTemplate,
	Megaphone,
	PencilLine,
} from "lucide-react";
import { canvas } from "@/lib/canvas";

export function ClassSidebar({ onBack }: { onBack: () => void }) {
	const params = useParams({ strict: false }) as { classId?: string };
	const classId = params.classId;

	if (!classId) return null;

	const { course } = canvas.courses.useGet(classId);
	if (!course) return <div>Loading...</div>;

	return (
		<>
			<SidebarMenuButton onClick={onBack} className="text-muted-foreground">
				<ChevronLeft />
				<div className="mr-6 w-full text-center">{course.name}</div>
			</SidebarMenuButton>
			<SidebarMenuButton
				render={<Link to="/classes/$classId" params={{ classId }} />}
			>
				<LayoutGrid />
				Overview
			</SidebarMenuButton>
			<SidebarMenuButton>
				<Megaphone />
				Announcements
			</SidebarMenuButton>
			<SidebarMenuButton
				render={<Link to="/classes/$classId/modules" params={{ classId }} />}
			>
				<Blocks />
				Modules
			</SidebarMenuButton>
			<SidebarMenuButton
				render={
					<Link to="/classes/$classId/assignments" params={{ classId }} />
				}
			>
				<PencilLine />
				Assignments
			</SidebarMenuButton>
			<SidebarMenuButton>
				<LayoutList />
				Quizzes
			</SidebarMenuButton>
			<SidebarMenuButton>
				<LayoutTemplate />
				Pages
			</SidebarMenuButton>
		</>
	);
}
