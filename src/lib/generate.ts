import { randomBytes } from "node:crypto";
import { IMAGE_MODEL, requestEditedImage } from "./openaiImage";
import { createThumbnail, writeGeneratedSet } from "./images";
import { renderPrompt } from "./prompt";
import { insertGeneration, type StyleRecord } from "../server/records";

export async function generateForStyle(input: {
  style: StyleRecord;
  userId: string | null;
  person: Buffer;
  personName: string;
  celebrity?: Buffer;
  celebrityFileName?: string;
  celebrityName?: string;
  extraDetails?: string;
  choice?: string;
  choiceLabel?: string;
  reference?: Buffer;
  quality: "medium" | "high";
}) {
  const style = input.style;
  if (!style.active) {
    return { ok: false as const, status: 404, error: "Estilo no disponible" };
  }
  if (style.requiresCelebrity && !input.celebrity) {
    return { ok: false as const, status: 400, error: "Falta la foto de la celebridad" };
  }

  const extraDetails = input.extraDetails?.trim() || "";
  const storedDetails = [input.choiceLabel?.trim(), extraDetails].filter(Boolean).join(". ");
  const prompt = renderPrompt(style.promptTemplate, {
    celebrityName: input.celebrityName,
    extraDetails,
    choice: input.choice,
  });

  const started = Date.now();
  const output = await requestEditedImage({
    person: input.person,
    celebrity: input.celebrity ?? input.reference,
    prompt,
    quality: input.quality,
    aspectRatio: style.aspectRatio || "1:1",
  });
  const thumb = await createThumbnail(output);
  const stamp = `${style.id}_${Date.now()}_${randomBytes(3).toString("hex")}`;
  const files = writeGeneratedSet({
    id: stamp,
    output,
    thumb: thumb.data,
    person: input.person,
    celebrity: input.celebrity,
  });

  const generationTime = ((Date.now() - started) / 1000).toFixed(2);
  await insertGeneration({
    id: stamp,
    styleId: style.id,
    userId: input.userId,
    promptUsed: prompt,
    extraDetails: storedDetails,
    celebrityName: input.celebrityName?.trim() || null,
    quality: input.quality,
    model: IMAGE_MODEL,
    outputFile: files.outputFile,
    thumbFile: files.thumbFile,
    personFile: files.personFile,
    celebrityFile: files.celebrityFile,
    width: thumb.width,
    height: thumb.height,
    bytes: output.length,
    createdAt: new Date(),
  });

  return {
    ok: true as const,
    style,
    prompt,
    generationTime,
    outputFile: files.outputFile,
    thumbFile: files.thumbFile,
    personFile: files.personFile,
    celebrityFile: files.celebrityFile,
    personName: input.personName,
    celebrityFileName: input.celebrityFileName,
    extraDetails: storedDetails,
    celebrityName: input.celebrityName,
  };
}
