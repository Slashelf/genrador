import { resolveChoice } from "./choices";
import { friendlyImageError, resolveImageModel } from "./imageModels";
import { generateForStyle } from "./generate";
import { buildErrorResponse, buildSuccessResponse } from "./generationResponse";
import { readReferenceImage } from "./images";
import { getStyleBySlug } from "../server/records";

const MAX_BYTES = 15 * 1024 * 1024;

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleGenerate(request: Request, slug: string, userId: string) {
  const style = await getStyleBySlug(slug);
  if (!style || !style.active) {
    return json(buildErrorResponse("Estilo no disponible"), 404);
  }

  const form = await request.formData();
  const person = form.get("person");
  const extraDetails = form.get("extraDetails")?.toString() || "";
  const quality = form.get("quality")?.toString() || "medium";
  const chosenModel = resolveImageModel(form.get("model")?.toString() || "");
  const celebrity = form.get("celebrity");
  const celebrityName = form.get("celebrityName")?.toString() || "";
  const choice = resolveChoice(style.selectOptions, form.get("choice")?.toString() || "");
  if (!choice.ok) {
    return json(buildErrorResponse(choice.error), 400);
  }
  if (!chosenModel.ok) {
    return json(buildErrorResponse(chosenModel.error), 400);
  }

  if (!(person instanceof File)) {
    return json(buildErrorResponse("Falta la foto de la persona"), 400);
  }
  if (quality !== "medium" && quality !== "high") {
    return json(buildErrorResponse('La calidad debe ser "medium" o "high"'), 400);
  }
  if (person.size > MAX_BYTES) {
    return json(buildErrorResponse("La foto supera el tamaño permitido"), 400);
  }
  if (style.requiresCelebrity && !(celebrity instanceof File)) {
    return json(buildErrorResponse("Falta la foto de la celebridad"), 400);
  }
  if (celebrity instanceof File && celebrity.size > MAX_BYTES) {
    return json(buildErrorResponse("La foto supera el tamaño permitido"), 400);
  }

  let reference: Buffer | undefined;
  if (style.referenceFile && !style.requiresCelebrity) {
    const bytes = readReferenceImage(style.referenceFile);
    if (!bytes) {
      return json(buildErrorResponse(`Falta la foto de referencia. Coloca ${style.referenceFile} en data/references`), 400);
    }
    reference = bytes;
  }

  try {
    const result = await generateForStyle({
      style,
      userId,
      person: Buffer.from(await person.arrayBuffer()),
      personName: person.name,
      celebrity: celebrity instanceof File ? Buffer.from(await celebrity.arrayBuffer()) : undefined,
      celebrityFileName: celebrity instanceof File ? celebrity.name : undefined,
      celebrityName,
      extraDetails,
      choice: choice.prompt,
      choiceLabel: choice.label,
      reference,
      quality,
      model: chosenModel.model.id,
    });

    if (!result.ok) {
      return json(buildErrorResponse(result.error), result.status);
    }

    return json(buildSuccessResponse({
      styleId: result.style.id,
      requiresCelebrity: result.style.requiresCelebrity,
      outputFile: result.outputFile,
      thumbFile: result.thumbFile,
      generationTime: result.generationTime,
      prompt: result.prompt,
      personName: result.personName,
      celebrityFileName: result.celebrityFileName,
      extraDetails: result.extraDetails,
      celebrityName: result.celebrityName,
      styleName: result.style.name,
      icon: result.style.icon,
      description: result.style.description,
      slug: result.style.slug,
    }), 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return json(buildErrorResponse(friendlyImageError(message)), 500);
  }
}
