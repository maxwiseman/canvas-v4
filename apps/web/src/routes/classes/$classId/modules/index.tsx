// import {
// 	Accordion,
// 	AccordionContent,
// 	AccordionItem,
// 	AccordionTrigger,
// } from "@canvas-v4/ui/components/accordion";
import { Accordion } from "@base-ui/react";
import { Button } from "@canvas-v4/ui/components/button";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronUp, CircleCheck, CircleDashed } from "lucide-react";
import { canvas } from "@/lib/canvas";

export const Route = createFileRoute("/classes/$classId/modules/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { classId } = Route.useParams();
	const { modules } = canvas.modules.useListByCourse(classId);
	return (
		<div className="p-8">
			<Accordion.Root className="flex flex-col gap-1">
				{modules.map((module) => (
					<Accordion.Item>
						<Accordion.Trigger className="flex h-9 w-full items-center gap-3 rounded-md border border-border/50 bg-card/50 px-3 text-start text-sm transition-all">
							<ChevronUp className="size-4 text-muted-foreground data-open:rotate-180" />
							{module.name}
						</Accordion.Trigger>
						<Accordion.Panel className="flex flex-col gap-1 pt-1 pl-4">
							{module.items?.map((item) => (
								<Button
									key={item.id}
									variant="ghost"
									// render={
									// 	<Link
									// 		to="/classes/$classId/assignments/$assignmentId"
									// 		params={{ classId, assignmentId: item.id.toString() }}
									// 	/>
									// }
									className="h-10 justify-between rounded-md font-normal"
								>
									<div className="flex items-center gap-2">
										{true ? (
											<CircleCheck className="text-muted-foreground" />
										) : (
											<CircleDashed className="text-muted-foreground" />
										)}
										{item.title}
									</div>
									<div className="flex items-center gap-2 font-normal text-muted-foreground">
										{/*<Badge variant="outline">10 mins</Badge>*/}
										{new Date("May 1").toLocaleDateString(undefined, {
											month: "short",
											day: "numeric",
										})}
									</div>
								</Button>
							))}
						</Accordion.Panel>
					</Accordion.Item>
				))}
			</Accordion.Root>
		</div>
	);
}
