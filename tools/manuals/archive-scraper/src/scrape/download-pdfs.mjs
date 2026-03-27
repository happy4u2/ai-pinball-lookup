import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";
import { readJson, writeJson } from "../lib/fs-utils.mjs";
import { downloadFile } from "../lib/http.mjs";
import { safeFileName } from "../lib/text.mjs";

dotenv.config();

const ROOT = process.cwd();
const inputPath = path.join(ROOT, "output", "normalized", "archive_files_normalized.json");
const downloadsDir = path.join(ROOT, "output", "downloads");
const reportPath = path.join(ROOT, "output", "normalized", "archive_download_report.json");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  fs.mkdirSync(downloadsDir, { recursive: true });

  const rows = readJson(inputPath, []);
  if (!rows.length) {
    throw new Error(`No input rows found in ${inputPath}`);
  }

  const pdfRows = rows.filter(x => x.isPdf === true && x.fileUrl);
  const limit = Number(process.env.DOWNLOAD_LIMIT || 25);

  console.log("Total PDF rows found:", pdfRows.length);
  console.log("Download limit:", limit);

  const selected = pdfRows.slice(0, limit);
  const report = [];

  for (let i = 0; i < selected.length; i++) {
    const row = selected[i];

    const baseName = safeFileName(
      `${row.archiveTitle || row.identifier}__${row.fileName || "file.pdf"}`
    );

    const ext = path.extname(row.fileName || "") || ".pdf";
    const savePath = path.join(downloadsDir, baseName.endsWith(ext) ? baseName : `${baseName}${ext}`);

    console.log(`[${i + 1}/${selected.length}] Downloading: ${row.fileUrl}`);

    try {
      await downloadFile(row.fileUrl, savePath);

      report.push({
        identifier: row.identifier,
        archiveTitle: row.archiveTitle,
        fileName: row.fileName,
        fileUrl: row.fileUrl,
        savedFile: savePath,
        status: "downloaded"
      });
    } catch (error) {
      console.error(`Failed: ${error.message}`);

      report.push({
        identifier: row.identifier,
        archiveTitle: row.archiveTitle,
        fileName: row.fileName,
        fileUrl: row.fileUrl,
        savedFile: "",
        status: `failed: ${error.message}`
      });
    }

    await sleep(300);
  }

  writeJson(reportPath, report);

  console.log("Saved report:", reportPath);
  console.log("Downloaded:", report.filter(x => x.status === "downloaded").length);
}
await main().catch(error => {
  console.error(error);
  process.exit(1);
});