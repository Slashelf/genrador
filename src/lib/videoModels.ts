export const VIDEO_DURATION_SECONDS = 3;

export const VIDEO_RESOLUTIONS = ["480p", "720p"] as const;
export const VIDEO_ASPECTS = ["9:16", "16:9", "1:1"] as const;

export type VideoResolution = (typeof VIDEO_RESOLUTIONS)[number];
export type VideoAspect = (typeof VIDEO_ASPECTS)[number];

const RATES = {
  "grok-imagine-video": { "480p": 0.05, "720p": 0.07 },
  "grok-imagine-video-1.5": { "480p": 0.08, "720p": 0.14 },
} as const;

export const VIDEO_MODELS = [
  { id: "grok-imagine-video", label: "Económico" },
  { id: "grok-imagine-video-1.5", label: "Calidad alta" },
] as const;

export const DEFAULT_VIDEO_MODEL = VIDEO_MODELS[0].id;
export const DEFAULT_VIDEO_RESOLUTION: VideoResolution = "480p";
export const DEFAULT_VIDEO_ASPECT: VideoAspect = "9:16";

export function resolveVideoModel(value: string | undefined) {
  const id = value?.trim() || DEFAULT_VIDEO_MODEL;
  const model = VIDEO_MODELS.find((item) => item.id === id);
  if (!model) return { ok: false as const, error: "Elige un modelo de la lista" };
  return { ok: true as const, model };
}

export function resolveVideoResolution(value: string | undefined) {
  const resolution = value?.trim() || DEFAULT_VIDEO_RESOLUTION;
  if (resolution !== "480p" && resolution !== "720p") {
    return { ok: false as const, error: "La resolución debe ser 480p o 720p" };
  }
  return { ok: true as const, resolution };
}

export function resolveVideoAspect(value: string | undefined) {
  const aspect = value?.trim() || DEFAULT_VIDEO_ASPECT;
  if (aspect !== "9:16" && aspect !== "16:9" && aspect !== "1:1") {
    return { ok: false as const, error: "El tamaño debe ser 9:16, 16:9 o 1:1" };
  }
  return { ok: true as const, aspect };
}

export function resolveVideoDuration(value: string | number | undefined) {
  const raw = value === undefined || value === "" ? String(VIDEO_DURATION_SECONDS) : String(value);
  const seconds = Number(raw);
  if (seconds !== 3 && seconds !== 6) {
    return { ok: false as const, error: "La duración del video no es válida" };
  }
  return { ok: true as const, seconds };
}

export function videoPrice(modelId: string, resolution: string, seconds = VIDEO_DURATION_SECONDS) {
  const rates = RATES[modelId as keyof typeof RATES];
  const rate = rates?.[resolution as VideoResolution] ?? rates?.["480p"] ?? 0;
  return rate * seconds;
}

export function videoPriceLabel(modelId: string, resolution: string, seconds = VIDEO_DURATION_SECONDS) {
  return `$${videoPrice(modelId, resolution, seconds).toFixed(2)} por video`;
}

export function videoModelLabel(id: string) {
  const model = VIDEO_MODELS.find((item) => item.id === id);
  if (!model) return id;
  return `${model.label} · ${model.id}`;
}

export function friendlyVideoError(message: string) {
  if (message.includes("XAI_API_KEY") || message.includes("no está configurada")) {
    return "No pudimos crear el video porque falta la clave de Grok. Avísale a quien administra la feria.";
  }
  if (message.includes("no es válida") || message.includes("no tiene permiso")) {
    return "No pudimos crear el video. La clave de Grok no tiene permiso. Avísale a quien administra la feria.";
  }
  if (message.startsWith("No se pudo") || message.startsWith("No pudimos")) return message;
  return "No se pudo crear el video. Puedes intentarlo otra vez.";
}

export const VIDEO_LIKENESS_PREFIX =
  "The main character is the person in the reference photo. Copy their face, gender, age, hairstyle, hair color, skin tone, and glasses or accessories onto that character. Do not replace them with a different person or change their gender. ";

export function withVideoLikeness(prompt: string) {
  const text = prompt.trim();
  if (text.startsWith("The main character is the person in the reference photo.")) return text;
  return `${VIDEO_LIKENESS_PREFIX}${text}`;
}

export function videoFrameSize(resolution: VideoResolution, aspect: VideoAspect) {
  const table = {
    "480p": { "9:16": [480, 854], "16:9": [854, 480], "1:1": [480, 480] },
    "720p": { "9:16": [720, 1280], "16:9": [1280, 720], "1:1": [720, 720] },
  } as const;
  const [width, height] = table[resolution][aspect];
  return { width, height };
}
