const ALLOWED_FIELDS = [
  "aliases",
  "manuals",
  "manualCandidates",

  "commonIssues",
  "repairNotes",
  "internalNotes",

  "coilReferences",
  "switchNotes",
  "lampNotes",
  "displayNotes",
  "mechanismNotes",
  "diagnosticChecks",
  "recommendedParts",

  "parts",
  "serviceTags",
  "content",
  "discovery",
  "status",
];

export function updateMetadataRecord(existingRecord, updates) {
  const now = new Date().toISOString();

  const next = {
    ...existingRecord,
    updatedAt: now,
  };

  for (const field of ALLOWED_FIELDS) {
    if (updates[field] !== undefined) {
      next[field] = updates[field];
    }
  }

  return next;
}
