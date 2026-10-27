export type StyleChoiceOption = {
  value: string;
  label: string;
  prompt: string;
};

export type StyleChoiceMenu = {
  label: string;
  options: StyleChoiceOption[];
};

export function parseStyleChoices(raw: string | null | undefined): StyleChoiceMenu | null {
  if (!raw?.trim()) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object" || !("options" in data)) return null;
  const record = data as { label?: unknown; options?: unknown };
  if (!Array.isArray(record.options)) return null;
  const options = record.options.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const option = item as { value?: unknown; label?: unknown; prompt?: unknown };
    if (typeof option.value !== "string" || typeof option.label !== "string" || typeof option.prompt !== "string") {
      return [];
    }
    if (!option.value.trim() || !option.label.trim() || !option.prompt.trim()) return [];
    return [{ value: option.value, label: option.label, prompt: option.prompt }];
  });
  if (options.length === 0) return null;
  return {
    label: typeof record.label === "string" && record.label.trim() ? record.label.trim() : "Opción",
    options,
  };
}

export function resolveChoice(raw: string | null | undefined, selected: string) {
  const menu = parseStyleChoices(raw);
  if (!menu) return { ok: true as const, prompt: "", label: "" };
  const option = menu.options.find((item) => item.value === selected);
  if (!option) return { ok: false as const, error: `Elige una opción de ${menu.label}` };
  return { ok: true as const, prompt: option.prompt, label: option.label };
}
