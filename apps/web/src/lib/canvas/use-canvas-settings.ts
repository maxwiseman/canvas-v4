import { useCallback, useEffect, useState } from "react";

import {
  clearCanvasSettings,
  type CanvasSettings,
  getCanvasSettings,
  saveCanvasSettings,
} from "@/lib/canvas/settings-client";

export function useCanvasSettings() {
  const [settings, setSettings] = useState<CanvasSettings>({
    domain: "",
    hasAccessToken: false,
    updatedAt: null,
  });
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);
    try {
      setSettings(await getCanvasSettings());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const save = useCallback(async (input: { domain: string; accessToken?: string }) => {
    setIsSaving(true);
    setError(undefined);
    try {
      const next = await saveCanvasSettings(input);
      setSettings(next);
      return next;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught);
      setError(message);
      throw caught;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const clear = useCallback(async () => {
    setIsSaving(true);
    setError(undefined);
    try {
      const next = await clearCanvasSettings();
      setSettings(next);
      return next;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught);
      setError(message);
      throw caught;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    clear,
    error,
    isLoading,
    isSaving,
    reload,
    save,
    settings,
  };
}
