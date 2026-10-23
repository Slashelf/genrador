import OpenAI, { toFile } from "openai";

export const IMAGE_MODEL = "gpt-image-1";

function client() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY no está configurada");
  }
  return new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || "https://api.laozhang.ai/v1",
  });
}

export async function requestEditedImage(input: {
  person: Buffer;
  celebrity?: Buffer;
  prompt: string;
  quality: "medium" | "high";
}) {
  const images = [await toFile(input.person, "person.png", { type: "image/png" })];
  if (input.celebrity) {
    images.push(await toFile(input.celebrity, "celebrity.png", { type: "image/png" }));
  }

  const response = await client().images.edit({
    model: IMAGE_MODEL,
    image: images,
    prompt: input.prompt,
    quality: input.quality,
    size: "1024x1024",
  });

  const imageBase64 = response.data?.[0]?.b64_json;
  if (!imageBase64) {
    throw new Error("El proveedor no devolvió una imagen");
  }
  return Buffer.from(imageBase64, "base64");
}
