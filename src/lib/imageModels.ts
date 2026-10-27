export const IMAGE_MODELS = [
  {
    id: "grok-imagine-image-2.0",
    label: "Calidad alta",
    price: "$0.04 por imagen",
  },
  {
    id: "grok-imagine-image",
    label: "Económico",
    price: "$0.02 por imagen",
  },
] as const;

export const DEFAULT_IMAGE_MODEL = IMAGE_MODELS[0].id;

export type ImageModelId = (typeof IMAGE_MODELS)[number]["id"];

export function resolveImageModel(value: string | undefined) {
  const id = value?.trim() || DEFAULT_IMAGE_MODEL;
  const model = IMAGE_MODELS.find((item) => item.id === id);
  if (!model) return { ok: false as const, error: "Elige un modelo de la lista" };
  return { ok: true as const, model };
}

export function imageModelLabel(id: string) {
  const model = IMAGE_MODELS.find((item) => item.id === id);
  if (!model) return id;
  return `${model.label} · ${model.id}`;
}

export function friendlyImageError(message: string) {
  if (message.includes("XAI_API_KEY") || message.includes("no está configurada")) {
    return "No pudimos crear la imagen porque falta la clave de Grok. Avísale a quien administra la feria.";
  }
  if (message.includes("no es válida") || message.includes("no tiene permiso")) {
    return "No pudimos crear la imagen. La clave de Grok no tiene permiso. Avísale a quien administra la feria.";
  }
  if (message.startsWith("No se pudo") || message.startsWith("No pudimos")) return message;
  return "No se pudo crear la imagen. Puedes intentarlo otra vez.";
}
