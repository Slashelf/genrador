import "dotenv/config";
import { resolveImageModel } from "./imageModels";

const EDIT_URL = "https://api.x.ai/v1/images/edits";

type ImageRef = { type: "image_url"; url: string };

function dataUrl(bytes: Buffer) {
  const mime = bytes[0] === 0xff && bytes[1] === 0xd8
    ? "image/jpeg"
    : bytes[0] === 0x89 && bytes[1] === 0x50
      ? "image/png"
      : bytes[0] === 0x52 && bytes[1] === 0x49
        ? "image/webp"
        : "image/jpeg";
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

export async function requestEditedImage(input: {
  person: Buffer;
  celebrity?: Buffer;
  prompt: string;
  quality: "medium" | "high";
  model?: string;
  aspectRatio?: string;
}) {
  const chosen = resolveImageModel(input.model);
  if (!chosen.ok) throw new Error(chosen.error);
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("XAI_API_KEY no está configurada");
  }

  const images: ImageRef[] = [{ type: "image_url", url: dataUrl(input.person) }];
  if (input.celebrity) {
    images.push({ type: "image_url", url: dataUrl(input.celebrity) });
  }

  const body: Record<string, unknown> = {
    model: chosen.model.id,
    prompt: input.prompt,
    aspect_ratio: ["1:1", "3:4", "4:3", "9:16", "16:9", "2:3", "3:2"].includes(input.aspectRatio || "")
      ? input.aspectRatio
      : "1:1",
    quality: "medium",
    resolution: input.quality === "high" ? "2k" : "1k",
    response_format: "b64_json",
  };
  if (images.length === 1) body.image = images[0];
  else body.images = images;

  const response = await fetch(EDIT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null) as {
    data?: { b64_json?: string; url?: string }[];
    error?: { message?: string } | string;
  } | null;

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("La clave de xAI no es válida o no tiene permiso");
    }
    const raw = typeof payload?.error === "string" ? payload.error : payload?.error?.message;
    const detail = raw?.replace(/xai-[A-Za-z0-9_-]+/g, "").trim().slice(0, 180);
    if (detail) throw new Error(`No se pudo crear la imagen. ${detail}`);
    throw new Error("No se pudo generar la imagen");
  }

  const first = payload?.data?.[0];
  if (first?.b64_json) return Buffer.from(first.b64_json, "base64");
  if (first?.url) {
    const image = await fetch(first.url);
    if (!image.ok) throw new Error("El proveedor no devolvió una imagen");
    return Buffer.from(await image.arrayBuffer());
  }
  throw new Error("El proveedor no devolvió una imagen");
}
