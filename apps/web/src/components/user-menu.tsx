import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@canvas-v4/ui/components/avatar";
import { Button } from "@canvas-v4/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@canvas-v4/ui/components/dropdown-menu";
import { Skeleton } from "@canvas-v4/ui/components/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Settings, SunMoon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
	clearCanvasSnapshot,
	clearMutationQueue,
} from "@/lib/canvas/indexed-db";
import { useTheme } from "./theme-provider";

export default function UserMenu() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <Skeleton className="h-9 w-24" />;
	}

	if (!session) {
		return (
			<Link to="/login">
				<Button variant="outline">Sign In</Button>
			</Link>
		);
	}

	const { theme, setTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Button variant="outline" />}>
				{/*<Avatar>
					<AvatarImage src={session.user.image ?? ""} />
					<AvatarFallback>{session.user.name?.[0] ?? "?"}</AvatarFallback>
				</Avatar>*/}
				{session.user.name}
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuGroup>
					<DropdownMenuLabel>
						<div className="font-medium text-foreground text-sm">
							{session.user.name}
						</div>
						<div className="text-sm">{session.user.email}</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem render={<Link to="/settings" />}>
						<Settings /> Settings
					</DropdownMenuItem>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<SunMoon /> Theme
						</DropdownMenuSubTrigger>
						<DropdownMenuContent side="right">
							<DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
								<DropdownMenuRadioItem value="system">
									System
								</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="light">
									Light
								</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenuSub>
					<DropdownMenuItem
						variant="destructive"
						onClick={() => {
							const userId = session.user.id;
							authClient.signOut({
								fetchOptions: {
									onSuccess: async () => {
										await Promise.all([
											clearCanvasSnapshot(userId),
											clearMutationQueue(userId),
										]);
										navigate({
											to: "/",
										});
									},
								},
							});
						}}
					>
						<LogOut /> Sign Out
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
