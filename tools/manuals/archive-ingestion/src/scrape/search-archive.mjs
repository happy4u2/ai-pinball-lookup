import path from "node:path";
import { readJson, writeJson } from "../lib/fs-utils.mjs";
import { fetchJson } from "../lib/http.mjs";

const ROOT = process.cwd();
const queriesPath = path.join(ROOT, "config", "queries.json");
const sourcesPath = path.join(ROOT, "config", "sources.json");
const rawOutPath = path.join(ROOT, "output", "raw", "archive_search_raw.json");
const normalizedOutPath = path.join(ROOT, "output", "normalized", "archive_search_normalized.json");

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

function buildSearchUrl(searchBase, query, page = 1) {
  const q = [
    '(title:"pinball" OR description:"pinball" OR subject:"pinball")',
    `(title:"${query}" OR description:"${query}" OR subject:"${query}")`,
    '(mediatype:texts OR mediatype:data)'
  ].join(" AND ");

  const params = new URLSearchParams({
    q,
    fl: "identifier,title,creator,year,date,publicdate,mediatype,collection,description,subject",
    rows: "50",
    page: String(page),
    output: "json"
  });

  return `${searchBase}?${params.toString()}`;
}

async function main() {
  const queries = readJson(queriesPath, []);
  const sources = readJson(sourcesPath, {});

  if (!queries.length) {
    throw new Error("No queries found in config/queries.json");
  }

  const raw = [];

  for (const query of queries) {
    for (let page = 1; page <= 3; page++) {
      const url = buildSearchUrl(sources.searchBase, query, page);
      console.log(`Searching: ${query} (page ${page})`);

      try {
        const json = await fetchJson(url);
        const count = json?.response?.docs?.length || 0;

        raw.push({
          query,
          page,
          url,
          response: json
        });

        console.log(`  Results: ${count}`);

        if (count === 0) {
          break;
        }
      } catch (error) {
        console.error(`Search failed for "${query}" page ${page}: ${error.message}`);
      }
    }
  }

  const docs = [];

  for (const entry of raw) {
    const found = entry.response?.response?.docs || [];

    for (const doc of found) {
      const identifier =
        doc.identifier ??
        doc.Identifier ??
        "";

      const title =
        doc.title ??
        doc.Title ??
        "";

      const creator = Array.isArray(doc.creator)
        ? doc.creator.join(" | ")
        : (doc.creator ?? doc.Creator ?? "");

      const year =
        doc.year ??
        doc.date ??
        doc.publicdate ??
        "";

      const mediatype =
        doc.mediatype ??
        doc.mediaType ??
        "";

      const collection = Array.isArray(doc.collection)
        ? doc.collection.join(" | ")
        : (doc.collection ?? "");

      const description = Array.isArray(doc.description)
        ? doc.description.join(" | ")
        : (doc.description ?? "");

      const subject = Array.isArray(doc.subject)
        ? doc.subject.join(" | ")
        : (doc.subject ?? "");

      docs.push({
        query: entry.query,
        page: entry.page,
        identifier: String(identifier || "").trim(),
        title: String(title || "").trim(),
        creator: String(creator || "").trim(),
        year: String(year || "").trim(),
        mediatype: String(mediatype || "").trim(),
        collection: String(collection || "").trim(),
        description: String(description || "").trim(),
        subject: String(subject || "").trim()
      });
    }
  }

  const normalized = dedupe(
    docs.filter(x => x.identifier || x.title),
    x => x.identifier || `${x.title}||${x.creator}||${x.year}`
  );

  console.log("Docs before dedupe:", docs.length);
  console.log("Docs after dedupe:", normalized.length);
  console.log("Preview:", normalized.slice(0, 5));

  writeJson(rawOutPath, raw);
  writeJson(normalizedOutPath, normalized);

  console.log("Saved raw:", rawOutPath);
  console.log("Saved normalized:", normalizedOutPath);
  console.log("Rows:", normalized.length);
}

await main().catch(error => {
  console.error(error);
  process.exit(1);
});