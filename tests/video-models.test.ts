import { describe, expect, it } from "vitest";
import { STYLE_SEEDS } from "../src/db/style-seeds";
import { buildSuccessResponse } from "../src/lib/generationResponse";
import {
  DEFAULT_VIDEO_MODEL,
  VIDEO_DURATION_SECONDS,
  friendlyVideoError,
  resolveVideoAspect,
  resolveVideoModel,
  resolveVideoResolution,
  videoPrice,
  videoPriceLabel,
} from "../src/lib/videoModels";

const TOKIO_PROMPT = "The person from the reference photo stands on a snowy Tokyo street at dusk, facing the camera, keeping their exact face, hairstyle, and clothing. Snowflakes and pink cherry blossom petals fall gently around them. Blurred crowds walk behind them. The camera stays in front of the person, handheld with a subtle natural shake, no rotation, no orbit, no camera turns. The person breathes calmly, blinks, and gives a soft smile. Soft warm lighting from shop signs, shallow depth of field, cinematic and peaceful winter mood. Realistic, natural movement.";

describe("videos de la feria", () => {
  it("guarda el prompt de Tokio y lo separa de las fotos", () => {
    const style = STYLE_SEEDS.find((item) => item.id === "tokio-nevado");
    expect(style?.kind).toBe("video");
    expect(style?.promptTemplate).toBe(TOKIO_PROMPT);
    expect(STYLE_SEEDS.filter((item) => item.kind === "video")).toHaveLength(1);
    expect(STYLE_SEEDS.filter((item) => item.kind !== "video").every((item) => item.kind === undefined)).toBe(true);
  });

  it("cobra 3 segundos según modelo y resolución", () => {
    expect(VIDEO_DURATION_SECONDS).toBe(3);
    const chosen = resolveVideoModel(undefined);
    expect(chosen.ok && chosen.model.id).toBe(DEFAULT_VIDEO_MODEL);
    expect(videoPrice("grok-imagine-video", "480p")).toBeCloseTo(0.15);
    expect(videoPrice("grok-imagine-video", "720p")).toBeCloseTo(0.21);
    expect(videoPrice("grok-imagine-video-1.5", "480p")).toBeCloseTo(0.24);
    expect(videoPrice("grok-imagine-video-1.5", "720p")).toBeCloseTo(0.42);
    expect(videoPriceLabel("grok-imagine-video", "480p")).toBe("$0.15 por video");
  });

  it("rechaza modelo, resolución y tamaño que no están en la lista", () => {
    expect(resolveVideoModel("grok-imagine-video-1.5-lite").ok).toBe(false);
    expect(resolveVideoResolution("1080p").ok).toBe(false);
    expect(resolveVideoAspect("4:5").ok).toBe(false);
    expect(resolveVideoResolution(undefined).ok && resolveVideoResolution(undefined).resolution).toBe("480p");
    expect(resolveVideoAspect(undefined).ok && resolveVideoAspect(undefined).aspect).toBe("9:16");
  });

  it("responde video cuando el archivo es mp4", () => {
    const body = buildSuccessResponse({
      styleId: "tokio-nevado",
      requiresCelebrity: false,
      outputFile: "tokio-nevado.mp4",
      thumbFile: "tokio-nevado.webp",
      generationTime: "40.00",
      prompt: TOKIO_PROMPT,
      personName: "persona.png",
      extraDetails: "",
      styleName: "Tokio nevado",
      icon: "snowflake",
      description: "Tu cara en una calle nevada de Tokio, al atardecer.",
    });
    expect(body.media).toBe("video");
    expect(body.message).toBe("Video generado");
    expect(friendlyVideoError("La clave de xAI no es válida o no tiene permiso")).toContain("video");
    expect(friendlyVideoError("No se pudo crear el video. Tardó demasiado. Puedes intentarlo otra vez.")).toContain("Tardó demasiado");
  });
});
