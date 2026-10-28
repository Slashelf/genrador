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
  ".mp4": "video/mp4",
};

function fileStream(filePath: string, start?: number, end?: number) {
  return new ReadableStream({
    start(controller) {
      const fileStream = createReadStream(filePath, start === undefined ? undefined : { start, end });
      fileStream.on("data", (chunk) => controller.enqueue(new Uint8Array(chunk)));
      fileStream.on("end", () => controller.close());
      fileStream.on("error", (error) => controller.error(error));
    },
  });
}

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
  const isVideo = contentType === "video/mp4";
  const range = request.headers.get("range");
  if (!range && request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag } });
  }

  if (isVideo && range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    const invalid = !match || (match[1] === "" && match[2] === "");
    let start = 0;
    let end = stats.size - 1;
    if (!invalid && match) {
      if (match[1] === "") {
        const suffix = Number(match[2]);
        start = Math.max(stats.size - suffix, 0);
      } else {
        start = Number(match[1]);
        end = match[2] === "" ? stats.size - 1 : Number(match[2]);
      }
    }
    if (invalid || Number.isNaN(start) || Number.isNaN(end) || start < 0 || start >= stats.size || end < start) {
      return new Response(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${stats.size}` },
      });
    }
    end = Math.min(end, stats.size - 1);
    return new Response(fileStream(filePath, start, end), {
      status: 206,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(end - start + 1),
        "Content-Range": `bytes ${start}-${end}/${stats.size}`,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        ETag: etag,
      },
    });
  }

  const headers = new Headers({
    "Content-Type": contentType,
    "Content-Length": stats.size.toString(),
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
    ETag: etag,
  });
  if (isVideo) headers.set("Accept-Ranges", "bytes");

  return new Response(fileStream(filePath), { status: 200, headers });
};
