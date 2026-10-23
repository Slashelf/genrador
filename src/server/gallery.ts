import { getGalleryStatsFromImages, toGalleryImage, type GalleryImage } from "../lib/galleryView";
import { listGenerationsWithStyles, listStyles } from "./records";

export type { GalleryImage };
export { listStyles, getGalleryStatsFromImages };

export async function getGeneratedImages(): Promise<GalleryImage[]> {
  const rows = await listGenerationsWithStyles();
  return rows.map(({ generation, style }) => toGalleryImage(generation, style));
}

export async function getGalleryStats() {
  return getGalleryStatsFromImages(await getGeneratedImages());
}
