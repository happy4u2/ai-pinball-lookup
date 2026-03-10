export function createMetadataShell(machine) {
  const now = new Date().toISOString();

  return {
    machineId: `opdb:${String(machine.opdb_id || machine.id).toLowerCase()}`,
    opdbId: machine.opdb_id || machine.id || null,

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

    status: "active",
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
  };
}
