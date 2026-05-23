import {
	SidebarInset,
	SidebarProvider,
} from "@canvas-v4/ui/components/sidebar";
import { Toaster } from "@canvas-v4/ui/components/sonner";
import { TooltipProvider } from "@canvas-v4/ui/components/tooltip";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { AppSidebar } from "@/components/app-sidebar";

import appCss from "../index.css?url";
// import Header from "../components/header";
import { CanvasDataProvider } from "../lib/canvas/provider";

export type RouterAppContext = {};

export const Route = createRootRouteWithContext<RouterAppContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "My App",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	component: RootDocument,
});

function RootDocument() {
	return (
		<html className="overscroll-none antialiased" lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<CanvasDataProvider>
					<TooltipProvider>
						<SidebarProvider>
							<AppSidebar />
							<SidebarInset className="overflow-clip">
								{/*<Header />*/}
								<div className="relative size-full">
									<div className="absolute size-full overflow-scroll p-1">
										<Outlet />
									</div>
								</div>
							</SidebarInset>
						</SidebarProvider>
					</TooltipProvider>
				</CanvasDataProvider>
				<Toaster richColors />
				<TanStackRouterDevtools position="bottom-right" />
				<Scripts />
			</body>
		</html>
	);
}
