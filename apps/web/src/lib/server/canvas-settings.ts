import { db } from "@canvas-v4/db";
import { canvasAccountSettings } from "@canvas-v4/db/schema";
import { eq } from "drizzle-orm";

export async function getCanvasSettings(userId: string) {
  return db.query.canvasAccountSettings.findFirst({
    where: eq(canvasAccountSettings.userId, userId),
  });
}
