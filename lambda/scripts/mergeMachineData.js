export function mergeMachineData(machine, metadata) {
  return {
    ...machine,
    metadata: metadata
      ? {
          machineId: metadata.machineId,
          aliases: metadata.aliases || [],
          manuals: metadata.manuals || [],
          parts: metadata.parts || [],
          commonIssues: metadata.commonIssues || [],
          repairNotes: metadata.repairNotes || [],
          internalNotes: metadata.internalNotes || [],
          serviceTags: metadata.serviceTags || [],
          content: metadata.content || {},
          status: metadata.status || "active",
          schemaVersion: metadata.schemaVersion || 1,
          createdAt: metadata.createdAt || null,
          updatedAt: metadata.updatedAt || null,
        }
      : null,
  };
}
