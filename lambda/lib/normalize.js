export function normalizeMachineName(value) {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .replace(/\s+/g, " ");
}
