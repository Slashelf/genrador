import { describe, expect, it } from "vitest";
import {
  DEFAULT_IMAGE_MODEL,
  IMAGE_MODELS,
  friendlyImageError,
  imageModelLabel,
  resolveImageModel,
} from "../src/lib/imageModels";

describe("modelos de Grok", () => {
  it("elige calidad alta por defecto y muestra el precio", () => {
    const chosen = resolveImageModel(undefined);
    expect(chosen.ok).toBe(true);
    if (!chosen.ok) return;
    expect(chosen.model.id).toBe(DEFAULT_IMAGE_MODEL);
    expect(chosen.model.id).toBe("grok-imagine-image-2.0");
    expect(chosen.model.label).toBe("Calidad alta");
    expect(chosen.model.price).toBe("$0.04 por imagen");
    expect(IMAGE_MODELS[1]).toMatchObject({
      id: "grok-imagine-image",
      label: "Económico",
      price: "$0.02 por imagen",
    });
  });

  it("rechaza un modelo que no está en la lista", () => {
    expect(resolveImageModel("gpt-image-1").ok).toBe(false);
  });

  it("nombra el modelo guardado y suaviza el fallo", () => {
    expect(imageModelLabel("grok-imagine-image")).toBe("Económico · grok-imagine-image");
    expect(imageModelLabel("gpt-image-1")).toBe("gpt-image-1");
    expect(friendlyImageError("XAI_API_KEY no está configurada")).toMatch(/falta la clave de Grok/);
    expect(friendlyImageError("La clave de xAI no es válida o no tiene permiso")).toMatch(/no tiene permiso/);
    expect(friendlyImageError("No se pudo generar la imagen")).toBe("No se pudo generar la imagen");
    expect(friendlyImageError("socket hang up")).toMatch(/intentarlo otra vez/);
    expect(friendlyImageError("No se pudo crear la imagen. Image dimensions 1x1 are too small.")).toMatch(/too small/);
  });
});
