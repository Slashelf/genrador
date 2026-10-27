function fillPlaceholder(prompt: string, token: string, value: string) {
  if (value) return prompt.replaceAll(`{{${token}}}`, value);
  const cleared = prompt.replace(new RegExp(`\\n*[^\\n{}]*\\{\\{${token}\\}\\}`, "g"), "");
  return cleared.replaceAll(`{{${token}}}`, "");
}

export function renderPrompt(
  template: string,
  values: { celebrityName?: string; extraDetails?: string; choice?: string },
) {
  const celebrityName = values.celebrityName?.trim() || "una celebridad";
  let prompt = template.replaceAll("{{celebrityName}}", celebrityName);
  prompt = fillPlaceholder(prompt, "extraDetails", values.extraDetails?.trim() || "");
  prompt = fillPlaceholder(prompt, "choice", values.choice?.trim() || "");
  return prompt.trim();
}
