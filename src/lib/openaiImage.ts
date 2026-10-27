export const IMAGE_MODEL = "grok-imagine-image-2.0";

const EDIT_URL = "https://api.x.ai/v1/images/edits";

type ImageRef = { type: "image_url"; url: string };

function dataUrl(bytes: Buffer) {
  return `data:image/png;base64,${bytes.toString("base64")}`;
}

export async function requestEditedImage(input: {
  person: Buffer;
  celebrity?: Buffer;
  prompt: string;
  quality: "medium" | "high";
  aspectRatio?: string;
}) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("XAI_API_KEY no está configurada");
  }

  const images: ImageRef[] = [{ type: "image_url", url: dataUrl(input.person) }];
  if (input.celebrity) {
    images.push({ type: "image_url", url: dataUrl(input.celebrity) });
  }

  const body: Record<string, unknown> = {
    model: IMAGE_MODEL,
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
    error?: { message?: string };
  } | null;

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("La clave de xAI no es válida o no tiene permiso");
    }
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
