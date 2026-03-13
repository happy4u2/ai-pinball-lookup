function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\- ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueStrings(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function extractStringsFromArray(items = []) {
  const output = [];

  for (const item of items) {
    if (!item) continue;

    if (typeof item === "string") {
      const value = item.trim();
      if (value) output.push(value);
      continue;
    }

    if (typeof item === "object") {
      for (const value of Object.values(item)) {
        if (typeof value === "string" && value.trim()) {
          output.push(value.trim());
        }
      }
    }
  }

  return output;
}

function tokenize(text) {
  const stopWords = new Set([
    "the",
    "and",
    "for",
    "with",
    "from",
    "that",
    "this",
    "into",
    "when",
    "then",
    "than",
    "check",
    "inspect",
  ]);

  return uniqueStrings(
    normalizeText(text)
      .split(" ")
      .map((token) => token.trim())
      .filter((token) => token.length >= 2 && !stopWords.has(token)),
  );
}

export function buildKnowledgeIndex(metadata = {}) {
  const sections = {
    commonIssues: extractStringsFromArray(metadata.commonIssues || []),
    repairNotes: extractStringsFromArray(metadata.repairNotes || []),
    internalNotes: extractStringsFromArray(metadata.internalNotes || []),
    coilReferences: extractStringsFromArray(metadata.coilReferences || []),
    switchNotes: extractStringsFromArray(metadata.switchNotes || []),
    lampNotes: extractStringsFromArray(metadata.lampNotes || []),
    displayNotes: extractStringsFromArray(metadata.displayNotes || []),
    mechanismNotes: extractStringsFromArray(metadata.mechanismNotes || []),
    diagnosticChecks: extractStringsFromArray(metadata.diagnosticChecks || []),
    recommendedParts: extractStringsFromArray(metadata.recommendedParts || []),
    serviceTags: extractStringsFromArray(metadata.serviceTags || []),
    manuals: extractStringsFromArray(metadata.manuals || []),
    parts: extractStringsFromArray(metadata.parts || []),
  };

  const allTextParts = [
    metadata.name || "",
    metadata.manufacturer || "",
    ...sections.commonIssues,
    ...sections.repairNotes,
    ...sections.internalNotes,
    ...sections.coilReferences,
    ...sections.switchNotes,
    ...sections.lampNotes,
    ...sections.displayNotes,
    ...sections.mechanismNotes,
    ...sections.diagnosticChecks,
    ...sections.recommendedParts,
    ...sections.serviceTags,
    ...sections.manuals,
    ...sections.parts,
  ];

  const searchText = normalizeText(allTextParts.join(" "));
  const tokens = tokenize(searchText);

  return {
    machineId: metadata.machineId || null,
    name: metadata.name || null,
    manufacturer: metadata.manufacturer || null,
    searchText,
    tokens,
    sections,
    generatedAt: new Date().toISOString(),
  };
}
