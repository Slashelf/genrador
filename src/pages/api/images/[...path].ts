import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";
import { createReadStream } from "node:fs";
import { ensureThumbnailFile, resolveGeneratedPath } from "../../../lib/images";

export const prerender = false;

const types: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export const GET: APIRoute = async ({ params, request, url }) => {
  const relative = params.path;
  if (!relative) {
    return new Response("File path not provided", { status: 400 });
  }

  const resolved = resolveGeneratedPath(relative);
  if (!resolved || !fs.existsSync(resolved)) {
    return new Response("File not found", { status: 404 });
  }

  let filePath = resolved;
  if (url.searchParams.get("variant") === "thumb" && path.extname(resolved).toLowerCase() === ".png") {
    filePath = await ensureThumbnailFile(resolved);
  }

  const stats = fs.statSync(filePath);
  const contentType = types[path.extname(filePath).toLowerCase()] || "application/octet-stream";
  const etag = `"${stats.mtime.getTime()}-${stats.size}"`;
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag } });
  }

  const headers = new Headers({
    "Content-Type": contentType,
    "Content-Length": stats.size.toString(),
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
    ETag: etag,
  });

  const stream = new ReadableStream({
    start(controller) {
      const fileStream = createReadStream(filePath);
      fileStream.on("data", (chunk) => controller.enqueue(new Uint8Array(chunk)));
      fileStream.on("end", () => controller.close());
      fileStream.on("error", (error) => controller.error(error));
    },
  });

  return new Response(stream, { status: 200, headers });
};
