import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { describe, expect, it } from "vitest";
import { styles } from "../src/db/schema";
import { renderPrompt } from "../src/lib/prompt";

describe("plantilla de prompt", () => {
  it("sustituye celebridad y detalles", () => {
    const prompt = renderPrompt("Foto con {{celebrityName}}. Nota: {{extraDetails}}", {
      celebrityName: "Ada",
      extraDetails: "luces rojas",
    });
    expect(prompt).toBe("Foto con Ada. Nota: luces rojas");
  });

  it("sustituye la época y la quita si no hay elección", () => {
    expect(renderPrompt("Óleo. {{choice}}\n\nNota: {{extraDetails}}", {
      choice: "Marco dorado",
      extraDetails: "capa roja",
    })).toBe("Óleo. Marco dorado\n\nNota: capa roja");
    expect(renderPrompt("Óleo\n\nEra: {{choice}}", { choice: "  " })).toBe("Óleo");
  });

  it("quita el placeholder si no hay detalles", () => {
    const prompt = renderPrompt("Base\n\nAdditional details: {{extraDetails}}", {
      extraDetails: "   ",
    });
    expect(prompt).toBe("Base");
    expect(prompt.includes("{{")).toBe(false);
  });

  it("guarda la plantilla y la vuelve a leer", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "expo-feria-"));
    const sqlite = new Database(path.join(dir, "test.db"));
    sqlite.exec(`
      CREATE TABLE styles (
        id text PRIMARY KEY,
        slug text NOT NULL,
        name text NOT NULL,
        description text NOT NULL,
        icon text NOT NULL,
        prompt_template text NOT NULL,
        details_hint text NOT NULL,
        select_options text,
        reference_file text,
        aspect_ratio text DEFAULT '1:1' NOT NULL,
        requires_celebrity integer DEFAULT 0 NOT NULL,
        active integer DEFAULT 1 NOT NULL,
        sort_order integer DEFAULT 0 NOT NULL
      );
    `);
    const db = drizzle({ client: sqlite });
    await db.insert(styles).values({
      id: "yarn-doll",
      slug: "yarn-doll",
      name: "Yarn",
      description: "Muñeco",
      icon: "ribbon",
      promptTemplate: "Original {{extraDetails}}",
      detailsHint: "ayuda",
      requiresCelebrity: false,
      active: true,
      sortOrder: 1,
    });
    await db.update(styles).set({ promptTemplate: "Nuevo {{extraDetails}}" }).where(eq(styles.id, "yarn-doll"));
    const row = (await db.select().from(styles).where(eq(styles.id, "yarn-doll")))[0];
    expect(renderPrompt(row.promptTemplate, { extraDetails: "lana azul" })).toBe("Nuevo lana azul");
    sqlite.close();
  });
});
