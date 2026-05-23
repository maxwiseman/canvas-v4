import { Button } from "@canvas-v4/ui/components/button";
import { KeyRound, Save } from "lucide-react";
import { useEffect, useState } from "react";

import { useCanvasSettings } from "@/lib/canvas";

export function CanvasSettingsForm() {
  const { clear, error, isLoading, isSaving, save, settings } = useCanvasSettings();
  const [domain, setDomain] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    setDomain(settings.domain);
    setSavedAt(settings.updatedAt);
  }, [settings.domain, settings.updatedAt]);

  async function handleSave() {
    const next = await save({
      domain,
      accessToken: accessToken.trim() || undefined,
    });
    setAccessToken("");
    setSavedAt(next.updatedAt);
  }

  async function handleClear() {
    await clear();
    setDomain("");
    setAccessToken("");
    setSavedAt(null);
  }

  return (
    <section className="border border-border p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium text-sm">
          <KeyRound className="size-4" />
          Canvas account
        </div>
        <div className="text-muted-foreground text-xs">
          {settings.hasAccessToken ? "Token saved" : "No token saved"}
          {savedAt ? ` · Updated ${new Date(savedAt).toLocaleString()}` : ""}
        </div>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-1.5 text-sm">
          <span className="text-muted-foreground">Canvas domain</span>
          <input
            className="h-10 border border-input bg-background px-3"
            disabled={isLoading || isSaving}
            onChange={(event) => setDomain(event.target.value)}
            placeholder="knoxschools.instructure.com"
            value={domain}
          />
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="text-muted-foreground">Access token</span>
          <input
            className="h-10 border border-input bg-background px-3"
            disabled={isLoading || isSaving}
            onChange={(event) => setAccessToken(event.target.value)}
            placeholder={settings.hasAccessToken ? "Leave blank to keep saved token" : "Canvas access token"}
            type="password"
            value={accessToken}
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void handleSave()} disabled={isLoading || isSaving}>
            <Save className="size-4" />
            Save
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => void handleClear()} disabled={isLoading || isSaving}>
            Clear
          </Button>
        </div>
      </div>

      {error ? <p className="mt-3 text-destructive text-sm">{error}</p> : null}
    </section>
  );
}
