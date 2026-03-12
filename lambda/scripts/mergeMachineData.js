export function mergeMachineData(machine, metadata) {
  return {
    ...machine,
    metadata: metadata
      ? {
          machineId: metadata.machineId,

          reference: metadata.reference || {},
          references: metadata.references || {},
          enrichment: metadata.enrichment || {},

          aliases: metadata.aliases || [],
          manuals: metadata.manuals || [],
          parts: metadata.parts || [],

          commonIssues: metadata.commonIssues || [],
          repairNotes: metadata.repairNotes || [],
          internalNotes: metadata.internalNotes || [],

          serviceTags: metadata.serviceTags || [],

          coilReferences: metadata.coilReferences || [],
          switchNotes: metadata.switchNotes || [],
          lampNotes: metadata.lampNotes || [],
          displayNotes: metadata.displayNotes || [],
          mechanismNotes: metadata.mechanismNotes || [],
          diagnosticChecks: metadata.diagnosticChecks || [],
          recommendedParts: metadata.recommendedParts || [],

          content: metadata.content || {},

          status: metadata.status || "active",
          schemaVersion: metadata.schemaVersion || 2,

          createdAt: metadata.createdAt || null,
          updatedAt: metadata.updatedAt || null,
        }
      : null,
  };
}
