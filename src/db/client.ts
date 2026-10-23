import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { authRelations } from "./auth-schema";
import { relations } from "./relations";

const dataDir = path.resolve(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

const sqlite = new Database(path.join(dataDir, "expo-feria.db"));
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle({
  client: sqlite,
  relations: { ...relations, ...authRelations },
});

export { sqlite };
