import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import dayjs from "dayjs";

export const decksTable = sqliteTable("decks", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  hero_image_url: text("hero_image_url"),
  ai_prompt: text("ai_prompt"),
  wf_status: text("wf_status"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() =>
    dayjs().toDate()
  ),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() =>
    dayjs().toDate()
  ),
});

export const slidesTable = sqliteTable("slides", {
  id: text("id").primaryKey(),
  deck_id: text("deck_id").notNull(),
  deck_order: integer("deck_order", { mode: "number" }).notNull(),
  caption: text("caption"),
  image_url: text("image_url"),
  wf_status: text("wf_status"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() =>
    dayjs().toDate()
  ),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() =>
    dayjs().toDate()
  ),
});
