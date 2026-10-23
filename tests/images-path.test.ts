import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveGeneratedPath } from "../src/lib/images";

describe("ruta de imágenes", () => {
  it("rechaza salir de data/generated", () => {
    expect(resolveGeneratedPath("../package.json")).toBeNull();
    expect(resolveGeneratedPath(path.resolve("C:/Windows/notepad.exe"))).toBeNull();
    expect(resolveGeneratedPath("metadata/nota.json")).toBeNull();
  });

  it("acepta un archivo dentro de la carpeta", () => {
    const resolved = resolveGeneratedPath("que-paso-ayer-fiesta_1759118378986_dh7ldb.png");
    expect(resolved?.endsWith("que-paso-ayer-fiesta_1759118378986_dh7ldb.png")).toBe(true);
  });
});
