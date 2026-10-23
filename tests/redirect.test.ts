import { describe, expect, it } from "vitest";
import { safeRedirect } from "../src/lib/redirect";

describe("redirect", () => {
  it("solo acepta rutas relativas del sitio", () => {
    expect(safeRedirect("/catalog")).toBe("/catalog");
    expect(safeRedirect("/generate/yarn-doll")).toBe("/generate/yarn-doll");
    expect(safeRedirect("//evil.test")).toBe("/");
    expect(safeRedirect("https://evil.test")).toBe("/");
    expect(safeRedirect("\\\\server\\share")).toBe("/");
    expect(safeRedirect(null)).toBe("/");
  });
});
