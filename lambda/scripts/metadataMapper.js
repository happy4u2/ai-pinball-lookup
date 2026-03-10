export function createMetadataShell(machine) {
  const now = new Date().toISOString();

  const opdbId = machine.opdb_id || machine.id || null;
  const ipdbId = machine.ipdb_id || null;

  return {
    machineId: `opdb:${String(opdbId).toLowerCase()}`,
    opdbId,

    name: machine.name || null,
    normalizedName: (machine.name || "").trim().toLowerCase(),

    manufacturer: machine.manufacturer || null,
    year: machine.year || null,

    reference: {
      display: machine.display || null,
      players: machine.player_count || null,
      type: machine.type || null,
      features: Array.isArray(machine.features) ? machine.features : [],
    },

    references: {
      opdbId,
      ipdbId,
      ipdbMachineUrl: ipdbId
        ? `https://www.ipdb.org/machine.cgi?id=${ipdbId}`
        : null,
    },

    aliases: [],
    manuals: [],
    parts: [],

    commonIssues: [],
    repairNotes: [],
    internalNotes: [],

    serviceTags: [],

    content: {
      shortDescription: "",
      longDescription: "",
      keywords: [],
    },

    enrichment: {
      manualsSource: null,
      manualsFetchStatus: "not_attempted",
      manualsFetchedAt: null,
    },

    status: "active",
    schemaVersion: 2,
    createdAt: now,
    updatedAt: now,
  };
}
