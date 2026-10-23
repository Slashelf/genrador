import { asc, desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { generations, styles } from "../db/schema";

export type StyleRecord = typeof styles.$inferSelect;
export type GenerationInsert = typeof generations.$inferInsert;

export async function getStyleBySlug(slug: string) {
  const row = (await db.select().from(styles).where(eq(styles.slug, slug)))[0];
  return row ?? null;
}

export async function listStyles() {
  return db.select().from(styles).orderBy(asc(styles.sortOrder));
}

export async function insertGeneration(values: GenerationInsert) {
  await db.insert(generations).values(values);
}

export async function listGenerationsWithStyles() {
  return db
    .select({ generation: generations, style: styles })
    .from(generations)
    .leftJoin(styles, eq(generations.styleId, styles.id))
    .orderBy(desc(generations.createdAt));
}
