export function cleanText(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function safeFileName(value) {
  return cleanText(value)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .slice(0, 180);
}