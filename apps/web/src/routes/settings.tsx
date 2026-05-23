import { createFileRoute, redirect } from "@tanstack/react-router";

import { CanvasSettingsForm } from "@/components/canvas-settings-form";
import { getUser } from "@/functions/get-user";

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({
        to: "/login",
      });
    }
  },
});

function RouteComponent() {
  return (
    <main className="min-h-full bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-5 py-5">
        <header className="border-border border-b pb-4">
          <div className="text-muted-foreground text-sm">Settings</div>
          <h1 className="font-semibold text-2xl tracking-normal">Canvas connection</h1>
        </header>

        <CanvasSettingsForm />
      </div>
    </main>
  );
}
