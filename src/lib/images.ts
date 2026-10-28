import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

export const DATA_DIR = path.resolve(process.cwd(), "data", "generated");
const REFERENCES_DIR = path.resolve(process.cwd(), "data", "references");
const THUMB_WIDTH = 640;

export function resolveGeneratedPath(relativePath: string) {
  if (!relativePath || relativePath.includes("\0")) return null;
  const root = path.resolve(DATA_DIR);
  const full = path.resolve(root, relativePath);
  if (full !== root && !full.startsWith(root + path.sep)) return null;
  if (path.extname(full).toLowerCase() === ".json") return null;
  return full;
}

export function readReferenceImage(fileName: string) {
  if (!fileName || fileName.includes("\0") || /[\\/]/.test(fileName) || fileName.includes("..")) return null;
  const root = path.resolve(REFERENCES_DIR);
  const full = path.resolve(root, fileName);
  if (full !== root && !full.startsWith(root + path.sep)) return null;
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full);
}

export async function createThumbnail(input: Buffer) {
  const source = sharp(input, { failOn: "none" }).rotate();
  const meta = await source.metadata();
  const width = Math.min(THUMB_WIDTH, meta.width || THUMB_WIDTH);
  const data = await source
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer();
  const saved = await sharp(data).metadata();
  return {
    data,
    width: saved.width || width,
    height: saved.height || width,
  };
}

export function writeGeneratedSet(input: {
  id: string;
  output: Buffer;
  thumb: Buffer;
  person: Buffer;
  celebrity?: Buffer;
  outputExtension?: "png" | "mp4";
}) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const outputFile = `${input.id}.${input.outputExtension || "png"}`;
  const thumbFile = `${input.id}.webp`;
  const personFile = `${input.id}_person_original.png`;
  fs.writeFileSync(path.join(DATA_DIR, outputFile), input.output);
  fs.writeFileSync(path.join(DATA_DIR, thumbFile), input.thumb);
  fs.writeFileSync(path.join(DATA_DIR, personFile), input.person);

  let celebrityFile: string | null = null;
  if (input.celebrity) {
    celebrityFile = `${input.id}_celebrity_original.png`;
    fs.writeFileSync(path.join(DATA_DIR, celebrityFile), input.celebrity);
  }

  return { outputFile, thumbFile, personFile, celebrityFile };
}

export async function ensureThumbnailFile(pngPath: string) {
  const webpPath = pngPath.replace(/\.png$/i, ".webp");
  if (fs.existsSync(webpPath)) return webpPath;
  const thumb = await createThumbnail(fs.readFileSync(pngPath));
  fs.writeFileSync(webpPath, thumb.data);
  return webpPath;
}
