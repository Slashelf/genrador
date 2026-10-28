export type SuccessInput = {
  styleId: string;
  requiresCelebrity: boolean;
  outputFile: string;
  thumbFile: string;
  generationTime: string;
  prompt: string;
  personName: string;
  celebrityFileName?: string;
  extraDetails: string;
  celebrityName?: string;
  styleName: string;
  icon: string;
  description: string;
  slug?: string;
};

const SUCCESS_KEYS = [
  "success",
  "message",
  "imageUrl",
  "thumbUrl",
  "fileName",
  "generationTime",
  "prompt",
  "styleId",
  "images",
  "data",
  "style",
] as const;

export function buildSuccessResponse(input: SuccessInput) {
  const images: { person: string; celebrity?: string } = {
    person: input.personName,
  };
  const data: { extraDetails: string; celebrityName?: string } = {
    extraDetails: input.extraDetails,
  };

  if (input.requiresCelebrity) {
    images.celebrity = input.celebrityFileName || "";
    data.celebrityName = input.celebrityName || "";
  }

  return {
    success: true as const,
    message: input.outputFile.endsWith(".mp4") ? "Video generado" : "Imagen generada",
    media: input.outputFile.endsWith(".mp4") ? "video" as const : "image" as const,
    imageUrl: `/api/images/${input.outputFile}`,
    thumbUrl: `/api/images/${input.thumbFile}`,
    fileName: input.outputFile,
    generationTime: input.generationTime,
    prompt: input.prompt,
    styleId: input.styleId,
    images,
    data,
    style: {
      name: input.styleName,
      icon: input.icon,
      description: input.description,
      slug: input.slug || "",
    },
  };
}

export function buildErrorResponse(error: string) {
  return { success: false as const, error };
}

export function successKeySignature(body: ReturnType<typeof buildSuccessResponse>) {
  return SUCCESS_KEYS.filter((key) => key in body).join(",");
}
