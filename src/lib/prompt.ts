export function renderPrompt(
  template: string,
  values: { celebrityName?: string; extraDetails?: string },
) {
  const celebrityName = values.celebrityName?.trim() || "una celebridad";
  let prompt = template.replaceAll("{{celebrityName}}", celebrityName);
  const extraDetails = values.extraDetails?.trim() || "";

  if (extraDetails) {
    prompt = prompt.replaceAll("{{extraDetails}}", extraDetails);
  } else {
    prompt = prompt.replace(/\n*[^\n{}]*\{\{extraDetails\}\}/g, "");
    prompt = prompt.replaceAll("{{extraDetails}}", "");
  }

  return prompt.trim();
}
