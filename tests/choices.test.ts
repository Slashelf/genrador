import { describe, expect, it } from "vitest";
import { parseStyleChoices, resolveChoice } from "../src/lib/choices";
import { STYLE_SEEDS } from "../src/db/style-seeds";

describe("menú de época", () => {
  const epoca = STYLE_SEEDS.find((style) => style.id === "epoca-clasica");

  it("ofrece las seis épocas", () => {
    const menu = parseStyleChoices(epoca?.selectOptions);
    expect(menu?.label).toBe("Época");
    expect(menu?.options.map((option) => option.label)).toEqual([
      "Renacimiento",
      "Antigua Roma",
      "Medieval",
      "Barroco",
      "Victoriana",
      "Antiguo Egipto",
    ]);
  });

  it("rechaza una época que no está en la lista", () => {
    const result = resolveChoice(epoca?.selectOptions, "futuro");
    expect(result.ok).toBe(false);
  });

  it("acepta una época de la lista", () => {
    const result = resolveChoice(epoca?.selectOptions, "medieval");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.prompt.toLowerCase()).toContain("medieval");
  });

  it("las seis escenas de la feria quedan delante", () => {
    const ordered = [...STYLE_SEEDS].sort((a, b) => a.sortOrder - b.sortOrder);
    expect(ordered.slice(0, 4).map((style) => style.id)).toEqual([
      "epoca-clasica",
      "el-gran-premio",
      "optimus-prime",
      "mini-chibi-mano",
    ]);
    expect(ordered.some((style) => style.id.includes("frutinovela"))).toBe(false);
  });

  it("Optimus y el mini chibi usan el prompt pedido", () => {
    const optimus = STYLE_SEEDS.find((style) => style.id === "optimus-prime");
    const chibi = STYLE_SEEDS.find((style) => style.id === "mini-chibi-mano");
    expect(optimus?.promptTemplate.startsWith("A realistic close-up of the giant Optimus Prime head")).toBe(true);
    expect(optimus?.promptTemplate.endsWith("no blur, no cgi, no cartoon")).toBe(true);
    expect(chibi?.promptTemplate.startsWith("A mini chibi version of the character in the uploaded image")).toBe(true);
    expect(chibi?.promptTemplate.endsWith("vertical composition 4:5 ratio.")).toBe(true);
    expect(optimus?.promptTemplate.includes("{{")).toBe(false);
    expect(chibi?.promptTemplate.includes("{{")).toBe(false);
  });
});
