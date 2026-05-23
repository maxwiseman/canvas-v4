export interface CanvasSettings {
  domain: string;
  hasAccessToken: boolean;
  updatedAt: string | null;
}

export async function getCanvasSettings(): Promise<CanvasSettings> {
  return fetchCanvasSettings("/api/canvas-settings");
}

export async function saveCanvasSettings(input: {
  domain: string;
  accessToken?: string;
}): Promise<CanvasSettings> {
  return fetchCanvasSettings("/api/canvas-settings", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function clearCanvasSettings(): Promise<CanvasSettings> {
  return fetchCanvasSettings("/api/canvas-settings", {
    method: "DELETE",
  });
}

async function fetchCanvasSettings(input: string, init?: RequestInit): Promise<CanvasSettings> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init?.headers,
    },
  });
  const data = (await response.json()) as CanvasSettings | { error?: string };
  if (!response.ok) {
    throw new Error("error" in data && data.error ? data.error : `Canvas settings request failed: ${response.status}`);
  }
  return data as CanvasSettings;
}
