import path from "node:path";
import { readJson, writeJson } from "../lib/fs-utils.mjs";
import { writeCsv } from "../lib/csv.mjs";
import { fetchJson } from "../lib/http.mjs";

const ROOT = process.cwd();
const inputPath = path.join(ROOT, "output", "normalized", "archive_search_normalized.json");
const rawOutPath = path.join(ROOT, "output", "raw", "archive_files_raw.json");
const normalizedOutPath = path.join(ROOT, "output", "normalized", "archive_files_normalized.json");
const csvOutPath = path.join(ROOT, "output", "normalized", "archive_files_normalized.csv");

function dedupe(items, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ONLY keep real PDFs (no OCR/text junk)
function isRealPdf(name) {
  const n = String(name || "").toLowerCase();

  if (!n.endsWith(".pdf")) return false;

  if (n.endsWith("_text.pdf")) return false;
  if (n.endsWith("_jp2.pdf")) return false;
  if (n.endsWith("_djvu.pdf")) return false;

  return true;
}

// Exclude Archive junk files
function isJunkFile(name) {
  const n = String(name || "").toLowerCase();

  return (
    n.endsWith("_text.pdf") ||
    n.endsWith("_djvu.txt") ||
    n.endsWith("_djvu.xml") ||
    n.endsWith("_abbyy.gz") ||
    n.endsWith("_jp2.zip") ||
    n.endsWith("_scandata.xml") ||
    n.endsWith("_meta.xml")
  );
}

async function main() {
  const rows = readJson(inputPath, []);
  if (!rows.length) {
    throw new Error(`No input rows found in ${inputPath}`);
  }

  const raw = [];
  const flattened = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const identifier = row.identifier;

    if (!identifier) continue;

    const url = `https://archive.org/metadata/${encodeURIComponent(identifier)}`;
    console.log(`[${i + 1}/${rows.length}] Resolving: ${identifier}`);

    try {
      const meta = await fetchJson(url);

      raw.push({
        identifier,
        url,
        metadata: meta
      });

      const files = Array.isArray(meta.files) ? meta.files : [];

      for (const file of files) {
        const name = file.name || "";

        if (isJunkFile(name)) continue;
        if (!isRealPdf(name)) continue;

        flattened.push({
          identifier,
          archiveTitle: row.title || "",
          creator: row.creator || "",
          year: row.year || "",
          mediatype: row.mediatype || "",
          fileName: name,
          format: file.format || "",
          source: file.source || "",
          size: file.size || "",
          mtime: file.mtime || "",
          isPdf: true,
          fileUrl: `https://archive.org/download/${identifier}/${encodeURIComponent(name)}`
        });
      }
    } catch (error) {
      console.error(`Failed ${identifier}: ${error.message}`);

      raw.push({
        identifier,
        url,
        error: error.message
      });
    }

    await sleep(300);
  }

  const normalized = dedupe(
    flattened,
    x => `${x.identifier}||${x.fileName}`
  );

  writeJson(rawOutPath, raw);
  writeJson(normalizedOutPath, normalized);
  writeCsv(csvOutPath, normalized, [
    "identifier",
    "archiveTitle",
    "creator",
    "year",
    "mediatype",
    "fileName",
    "format",
    "source",
    "size",
    "mtime",
    "isPdf",
    "fileUrl"
  ]);

  console.log("Saved raw:", rawOutPath);
  console.log("Saved normalized:", normalizedOutPath);
  console.log("Saved CSV:", csvOutPath);
  console.log("Rows:", normalized.length);

  const pdfCount = normalized.length;
  console.log("Clean PDF rows:", pdfCount);
}

await main().catch(error => {
  console.error(error);
  process.exit(1);
});