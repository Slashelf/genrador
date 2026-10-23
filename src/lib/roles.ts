export function canGenerate(role: string | null | undefined) {
  return role === "admin" || role === "operator";
}
