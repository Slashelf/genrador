import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

export const styles = sqliteTable("styles", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  promptTemplate: text("prompt_template").notNull(),
  detailsHint: text("details_hint").notNull(),
  selectOptions: text("select_options"),
  referenceFile: text("reference_file"),
  aspectRatio: text("aspect_ratio").notNull().default("1:1"),
  kind: text("kind").notNull().default("image"),
  requiresCelebrity: integer("requires_celebrity", { mode: "boolean" }).notNull().default(false),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const generations = sqliteTable("generations", {
  id: text("id").primaryKey(),
  styleId: text("style_id").notNull().references(() => styles.id),
  userId: text("user_id").references(() => user.id),
  promptUsed: text("prompt_used").notNull(),
  extraDetails: text("extra_details").notNull().default(""),
  celebrityName: text("celebrity_name"),
  quality: text("quality").notNull(),
  model: text("model").notNull(),
  outputFile: text("output_file").notNull(),
  thumbFile: text("thumb_file").notNull(),
  personFile: text("person_file"),
  celebrityFile: text("celebrity_file"),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  bytes: integer("bytes").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});
