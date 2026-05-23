import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const canvasAccountSettings = pgTable(
  "canvas_account_settings",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    domain: text("domain").notNull(),
    accessToken: text("access_token").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("canvas_account_settings_user_id_unique").on(table.userId),
    index("canvas_account_settings_user_id_idx").on(table.userId),
  ],
);

export const canvasAccountSettingsRelations = relations(canvasAccountSettings, ({ one }) => ({
  user: one(user, {
    fields: [canvasAccountSettings.userId],
    references: [user.id],
  }),
}));
