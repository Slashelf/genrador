import { describe, expect, it } from "vitest";
import { STYLE_SEEDS } from "../src/db/style-seeds";
import { buildErrorResponse, buildSuccessResponse, successKeySignature } from "../src/lib/generationResponse";

function sample(style: (typeof STYLE_SEEDS)[number]) {
  return buildSuccessResponse({
    styleId: style.id,
    requiresCelebrity: style.requiresCelebrity,
    outputFile: `${style.id}.png`,
    thumbFile: `${style.id}.webp`,
    generationTime: "1.20",
    prompt: "prompt",
    personName: "persona.png",
    celebrityFileName: "celebridad.png",
    extraDetails: "detalle",
    celebrityName: "Ada",
    styleName: style.name,
    icon: style.icon,
    description: style.description,
  });
}

describe("formato de respuesta", () => {
  it("usa las mismas claves en los 13 estilos", () => {
    const bodies = STYLE_SEEDS.map(sample);
    const signatures = new Set(bodies.map(successKeySignature));
    expect(signatures.size).toBe(1);
    expect(bodies).toHaveLength(13);
    for (const body of bodies) {
      expect(body.success).toBe(true);
      expect(typeof body.message).toBe("string");
      expect(typeof body.imageUrl).toBe("string");
      expect(typeof body.thumbUrl).toBe("string");
      expect(typeof body.fileName).toBe("string");
      expect(typeof body.generationTime).toBe("string");
      expect(typeof body.prompt).toBe("string");
      expect(body.images.person).toBe("persona.png");
      expect(body.data.extraDetails).toBe("detalle");
    }
  });

  it("incluye celebridad solo cuando el estilo la pide", () => {
    const party = sample(STYLE_SEEDS.find((style) => style.requiresCelebrity)!);
    const chibi = sample(STYLE_SEEDS.find((style) => !style.requiresCelebrity)!);
    expect(party.images.celebrity).toBe("celebridad.png");
    expect(party.data.celebrityName).toBe("Ada");
    expect(chibi.images.celebrity).toBeUndefined();
    expect(chibi.data.celebrityName).toBeUndefined();
    expect(party.styleId).toBe("que-paso-ayer-fiesta");
  });

  it("el error solo trae success y error", () => {
    expect(buildErrorResponse("Falta la foto")).toEqual({
      success: false,
      error: "Falta la foto",
    });
  });
});
