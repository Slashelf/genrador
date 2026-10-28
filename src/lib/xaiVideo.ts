import "dotenv/config";
import { VIDEO_DURATION_SECONDS, type VideoAspect, type VideoResolution } from "./videoModels";

const START_URL = "https://api.x.ai/v1/videos/generations";
const POLL_MS = 5000;
const TIMEOUT_MS = 3 * 60 * 1000;

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

function errorMessage(payload: { error?: { message?: string } | string } | null, fallback: string) {
  const raw = typeof payload?.error === "string" ? payload.error : payload?.error?.message;
  const detail = raw?.replace(/xai-[A-Za-z0-9_-]+/g, "").trim().slice(0, 180);
  if (!detail) return fallback;
  if (detail.startsWith("No se pudo") || detail.startsWith("No pudimos")) return detail;
  return `${fallback} ${detail}`;
}

export async function requestReferenceVideo(input: {
  person: Buffer;
  prompt: string;
  model: string;
  resolution: VideoResolution;
  aspectRatio: VideoAspect;
}) {
  const apiKey = process.env.XAI_API_KEY?.trim();
  if (!apiKey) throw new Error("XAI_API_KEY no está configurada");

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  const started = await fetch(START_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: input.model,
      prompt: input.prompt,
      reference_images: [{ url: dataUrl(input.person) }],
      duration: VIDEO_DURATION_SECONDS,
      aspect_ratio: input.aspectRatio,
      resolution: input.resolution,
    }),
  });
  const startPayload = await started.json().catch(() => null) as {
    request_id?: string;
    error?: { message?: string } | string;
  } | null;
  if (!started.ok) {
    if (started.status === 401 || started.status === 403) {
      throw new Error("La clave de xAI no es válida o no tiene permiso");
    }
    throw new Error(errorMessage(startPayload, "No se pudo crear el video."));
  }

  const requestId = startPayload?.request_id;
  if (!requestId) throw new Error("No se pudo crear el video");

  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
    const result = await fetch(`${START_URL.replace(/\/generations$/, "")}/${requestId}`, {
      headers: { Authorization: headers.Authorization },
    });
    const data = await result.json().catch(() => null) as {
      status?: string;
      video?: { url?: string };
      error?: { message?: string } | string;
    } | null;
    if (data?.status === "done") {
      const url = data.video?.url;
      if (!url) throw new Error("No se pudo crear el video");
      const file = await fetch(url);
      if (!file.ok) throw new Error("No se pudo crear el video");
      return Buffer.from(await file.arrayBuffer());
    }
    if (data?.status === "failed" || (data && !result.ok)) {
      throw new Error(errorMessage(data, "No se pudo crear el video."));
    }
  }

  throw new Error("No se pudo crear el video. Tardó demasiado. Puedes intentarlo otra vez.");
}
