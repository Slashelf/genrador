import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { createThumbnail } from "../src/lib/images";

const sourcePath = path.resolve("data/generated/que-paso-ayer-fiesta_1759118378986_dh7ldb.png");

describe("miniatura", () => {
  it("comprime el PNG existente a WebP de 640 px", async () => {
    const input = fs.readFileSync(sourcePath);
    const thumb = await createThumbnail(input);
    const meta = await sharp(thumb.data).metadata();

    expect(meta.format).toBe("webp");
    expect(thumb.width).toBe(640);
    expect(thumb.data.length).toBeLessThan(input.length);
  });
});
