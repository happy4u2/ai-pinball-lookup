import { writeText } from "./fs-utils.mjs";

function csvEscape(value) {
  const s = String(value ?? "");
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function writeCsv(filePath, rows, headers) {
  const lines = [
    headers.join(","),
    ...rows.map(row => headers.map(h => csvEscape(row[h])).join(","))
  ];
  writeText(filePath, lines.join("\n"));
}