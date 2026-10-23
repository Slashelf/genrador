export function safeRedirect(value: string | null | undefined, fallback = "/") {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.includes("://")) {
    return fallback;
  }
  return value;
}
