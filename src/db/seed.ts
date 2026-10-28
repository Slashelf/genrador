import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { hashPassword } from "better-auth/crypto";
import { account, user } from "./auth-schema";
import { db } from "./client";
import { generations, styles } from "./schema";
import { STYLE_SEEDS } from "./style-seeds";
import { createThumbnail, DATA_DIR } from "../lib/images";

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const name = process.env.ADMIN_NAME || "Admin";
  const password = process.env.ADMIN_PASSWORD;
  const existing = await db.select().from(user);
  if (existing.length > 0) return;
  if (!email || !password) {
    throw new Error("Define ADMIN_EMAIL y ADMIN_PASSWORD para crear el primer admin");
  }

  const id = randomUUID();
  const now = new Date();
  await db.insert(user).values({
    id,
    name,
    email: email.toLowerCase(),
    emailVerified: true,
    role: "admin",
    createdAt: now,
    updatedAt: now,
  });
  await db.insert(account).values({
    id: randomUUID(),
    accountId: id,
    providerId: "credential",
    userId: id,
    password: await hashPassword(password),
    createdAt: now,
    updatedAt: now,
  });
}

const REFRESH_IDS = new Set([
  "epoca-clasica",
  "el-gran-premio",
  "optimus-prime",
  "mini-chibi-mano",
  "que-paso-ayer-fiesta",
  "buzz-cut-street",
  "figure-collector",
  "ghibli-classic",
  "tokio-nevado",
  "poster-naive",
  "asado-lunar",
  "pelea-te",
  "pelea-te-larga",
  "foto-libre",
  "video-libre",
]);

const RETIRED_IDS = ["frutinovela-carcel", "personaje-frutinovela"];

async function seedStyles() {
  for (const style of STYLE_SEEDS) {
    const current = (await db.select().from(styles).where(eq(styles.id, style.id)))[0];
    if (!current) {
      await db.insert(styles).values({
        ...style,
        active: "active" in style ? Boolean(style.active) : true,
      });
      continue;
    }
    if (REFRESH_IDS.has(style.id)) {
      await db.update(styles).set({
        slug: style.slug,
        name: style.name,
        description: style.description,
        icon: style.icon,
        promptTemplate: style.promptTemplate,
        detailsHint: style.detailsHint,
        selectOptions: "selectOptions" in style ? style.selectOptions : null,
        referenceFile: "referenceFile" in style ? style.referenceFile : null,
        aspectRatio: "aspectRatio" in style ? style.aspectRatio : "1:1",
        kind: "kind" in style && style.kind ? style.kind : "image",
        videoDuration: "videoDuration" in style && style.videoDuration ? style.videoDuration : 3,
        sortOrder: style.sortOrder,
      }).where(eq(styles.id, style.id));
      continue;
    }
    await db.update(styles).set({ sortOrder: style.sortOrder }).where(eq(styles.id, style.id));
  }
  for (const id of RETIRED_IDS) {
    await db.update(styles).set({ active: false }).where(eq(styles.id, id));
  }
}

async function importLegacy() {
  const metadataDir = path.join(DATA_DIR, "metadata");
  if (!fs.existsSync(metadataDir)) return;

  for (const file of fs.readdirSync(metadataDir).filter((name) => name.endsWith(".json"))) {
    const metadata = JSON.parse(fs.readFileSync(path.join(metadataDir, file), "utf8"));
    const outputFile = metadata.generatedImage?.fileName as string | undefined;
    const styleId = metadata.generation?.styleId as string | undefined;
    if (!outputFile || !styleId) continue;

    const pngPath = path.join(DATA_DIR, outputFile);
    if (!fs.existsSync(pngPath)) continue;
    const already = (await db.select().from(generations).where(eq(generations.outputFile, outputFile)))[0];
    if (already) continue;
    const knownStyle = (await db.select().from(styles).where(eq(styles.id, styleId)))[0];
    if (!knownStyle) continue;

    const thumb = await createThumbnail(fs.readFileSync(pngPath));
    const thumbFile = outputFile.replace(/\.png$/i, ".webp");
    fs.writeFileSync(path.join(DATA_DIR, thumbFile), thumb.data);

    const personFile = metadata.originalImages?.person?.fileName as string | undefined;
    if (personFile && fs.existsSync(path.join(DATA_DIR, personFile))) {
      const personThumb = await createThumbnail(fs.readFileSync(path.join(DATA_DIR, personFile)));
      fs.writeFileSync(path.join(DATA_DIR, personFile.replace(/\.png$/i, ".webp")), personThumb.data);
    }

    await db.insert(generations).values({
      id: outputFile.replace(/\.png$/i, ""),
      styleId,
      userId: null,
      promptUsed: metadata.generation?.prompt || "",
      extraDetails: metadata.generation?.extraDetails || "",
      celebrityName: metadata.generation?.celebrityName || null,
      quality: metadata.generation?.quality || "medium",
      model: metadata.generation?.model || "gpt-image-1",
      outputFile,
      thumbFile,
      personFile: personFile || null,
      celebrityFile: metadata.originalImages?.celebrity?.fileName || null,
      width: thumb.width,
      height: thumb.height,
      bytes: metadata.generatedImage?.size || fs.statSync(pngPath).size,
      createdAt: new Date(metadata.generatedImage?.createdAt || Date.now()),
    });
  }
}

migrate(db, { migrationsFolder: path.resolve("drizzle") });
await seedStyles();
await seedAdmin();
await importLegacy();
console.log("Base lista");
