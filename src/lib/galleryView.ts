import type { generations, styles } from "../db/schema";
import { imageModelLabel } from "./imageModels";
import { videoModelLabel } from "./videoModels";

type GenerationRow = typeof generations.$inferSelect;
type StyleRow = typeof styles.$inferSelect;

export type GalleryImage = {
  id: string;
  fileName: string;
  url: string;
  imageUrl: string;
  downloadUrl: string;
  createdAt: string;
  generationTime: string;
  size: number;
  generation: {
    styleId: string;
    celebrityName: string;
    extraDetails: string;
    prompt: string;
    quality: string;
    model: string;
    modelLabel: string;
  };
  styleId: string;
  styleName: string;
  icon: string;
  slug: string;
  description: string;
  celebrityName: string;
  extraDetails: string;
  prompt: string;
  originalImages: Record<string, { fileName: string; url: string; downloadUrl: string }>;
  hasMetadata: boolean;
  timestamp: number;
  availableImages: string[];
  availableDownloads: { key: string; label: string }[];
  displayTitle: string;
  displaySubtitle: string;
  style: {
    name: string;
    icon: string;
    description: string;
    slug: string;
  };
  kind: "image" | "video";
};

function thumbUrl(fileName: string) {
  if (fileName.endsWith(".webp")) return `/api/images/${fileName}`;
  return `/api/images/${fileName}?variant=thumb`;
}

function createdAtMs(value: Date | number) {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

export function toGalleryImage(row: GenerationRow, style: StyleRow | null): GalleryImage {
  const originalImages: GalleryImage["originalImages"] = {};
  const availableDownloads: GalleryImage["availableDownloads"] = [];

  if (row.personFile) {
    originalImages.person = {
      fileName: row.personFile,
      url: thumbUrl(row.personFile),
      downloadUrl: `/api/images/${row.personFile}`,
    };
    availableDownloads.push({ key: "person", label: "Descargar persona" });
  }
  if (row.celebrityFile) {
    originalImages.celebrity = {
      fileName: row.celebrityFile,
      url: thumbUrl(row.celebrityFile),
      downloadUrl: `/api/images/${row.celebrityFile}`,
    };
    availableDownloads.push({ key: "celebrity", label: "Descargar celebridad" });
  }

  const timestamp = createdAtMs(row.createdAt);
  const styleName = style?.name || row.styleId;
  const description = style?.description || "";
  const slug = style?.slug || row.styleId;
  const icon = style?.icon || "image";
  const extraDetails = row.extraDetails || "";
  const celebrityName = row.celebrityName || "";
  const kind = style?.kind === "video" || row.outputFile.endsWith(".mp4") ? "video" : "image";

  return {
    id: row.id,
    fileName: row.outputFile,
    url: `/api/images/${row.outputFile}`,
    imageUrl: `/api/images/${row.thumbFile}`,
    downloadUrl: `/api/images/${row.outputFile}`,
    createdAt: new Date(timestamp).toISOString(),
    generationTime: "",
    size: row.bytes,
    generation: {
      styleId: row.styleId,
      celebrityName,
      extraDetails,
      prompt: row.promptUsed,
      quality: row.quality,
      model: row.model,
      modelLabel: kind === "video" ? videoModelLabel(row.model) : imageModelLabel(row.model),
    },
    styleId: row.styleId,
    styleName,
    icon,
    slug,
    description,
    celebrityName,
    extraDetails,
    prompt: row.promptUsed,
    originalImages,
    hasMetadata: true,
    timestamp,
    availableImages: Object.keys(originalImages),
    availableDownloads,
    displayTitle: celebrityName.trim() || styleName,
    displaySubtitle: extraDetails.trim() || description,
    style: {
      name: styleName,
      icon,
      description,
      slug,
    },
    kind,
  };
}

export function getGalleryStatsFromImages(images: GalleryImage[]) {
  const totalImages = images.length;
  const totalSize = images.reduce((sum, image) => sum + (image.size || 0), 0);
  const validDates = images
    .map((image) => new Date(image.createdAt))
    .filter((date) => !Number.isNaN(date.getTime()));
  const oldestDate = validDates.length ? new Date(Math.min(...validDates.map((date) => date.getTime()))) : null;
  const newestDate = validDates.length ? new Date(Math.max(...validDates.map((date) => date.getTime()))) : null;

  return {
    totalImages,
    totalSize,
    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
    averageGenerationTime: "0",
    dateRange: {
      oldest: oldestDate?.toISOString() || null,
      newest: newestDate?.toISOString() || null,
    },
    lastGenerated: newestDate?.toISOString() || null,
  };
}
