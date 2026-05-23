import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@canvas-v4/ui/components/sidebar";
import { Link } from "@tanstack/react-router";
import {
	Atom,
	Blocks,
	BookOpen,
	BrainCircuit,
	ChevronLeft,
	Earth,
	FlaskConical,
	GraduationCap,
	Home,
	LayoutList,
	LayoutTemplate,
	Megaphone,
	MessageCircle,
	PencilLine,
	Sigma,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { canvas } from "@/lib/canvas";
import { ClassSidebar } from "./sidebar/class-sidebar";

const demoClasses = [
	{ icon: <FlaskConical />, name: "Biology" },
	{ icon: <Atom />, name: "Physics" },
	{ icon: <Sigma />, name: "A&A" },
	{ icon: <BookOpen />, name: "English" },
	{ icon: <Earth />, name: "Spanish" },
	{ icon: <BrainCircuit />, name: "ToK" },
];

export function AppSidebar() {
	const [hasGoneBack, setHasGoneBack] = useState(false);
	const { courses } = canvas.courses.useList();

	return (
		<Sidebar variant="inset">
			<SidebarContent>
				<AnimatePresence initial={false} mode="popLayout">
					{hasGoneBack && (
						<motion.div
							key="main-menu"
							transition={{
								ease: "easeOut",
								duration: 0.15,
							}}
							initial={{ opacity: 0, filter: "blur(2px)", x: -30 }}
							animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
							exit={{ opacity: 0, filter: "blur(2px)", x: -30 }}
							className="flex flex-col gap-2"
						>
							<SidebarMenuItem>
								<SidebarMenuButton onClick={() => setHasGoneBack(false)}>
									<Home />
									Home
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton onClick={() => setHasGoneBack(false)}>
									<MessageCircle />
									Chat
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton onClick={() => setHasGoneBack(false)}>
									<GraduationCap />
									Study
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarGroup>
								<SidebarGroupLabel>Classes</SidebarGroupLabel>
								<SidebarGroupContent>
									{courses.map((course) => (
										<SidebarMenuItem key={course.name}>
											<SidebarMenuButton
												onClick={() => {
													setHasGoneBack(false);
												}}
												render={
													<Link
														to="/classes/$classId"
														params={{ classId: course.id.toString() }}
													/>
												}
											>
												{/*{course.icon}*/}
												{course.name}
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarGroupContent>
							</SidebarGroup>
						</motion.div>
					)}
					{!hasGoneBack && (
						<motion.div
							key="sub-menu"
							transition={{
								ease: "easeOut",
								duration: 0.15,
							}}
							initial={{ opacity: 0, filter: "blur(2px)", x: 30 }}
							animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
							exit={{ opacity: 0, filter: "blur(2px)", x: 30 }}
							className="flex flex-col gap-2"
						>
							<ClassSidebar onBack={() => setHasGoneBack(true)} />
						</motion.div>
					)}
				</AnimatePresence>
			</SidebarContent>
		</Sidebar>
	);
}
