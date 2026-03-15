import { opdbDetailService } from "./opdbDetailService.js";
import { normalizeMachine } from "./normalizeMachine.js";
import { getMetadata, saveMetadata } from "./metadataService.js";
import { createMetadataShell } from "./metadataMapper.js";
import { buildMachineId } from "./metadataKeys.js";
import { discoverIpdbManuals } from "./ipdbManualService.js";
import { buildKnowledgeIndex } from "./buildKnowledgeIndex.js";

async function ensureMetadata(machine) {
  const metadataMachineId = buildMachineId(machine.opdb_id || machine.id);

  let metadata = await getMetadata(metadataMachineId);

  if (!metadata) {
    metadata = createMetadataShell(machine);
    metadata = await saveMetadata(metadata);
  }

  const hasManuals =
    Array.isArray(metadata.manuals) && metadata.manuals.length > 0;

  const ipdbId =
    metadata.references?.ipdbId || machine.ipdb_id || metadata.ipdbId || null;

  if (!hasManuals && ipdbId) {
    const discovery = await discoverIpdbManuals(ipdbId);

    metadata = {
      ...metadata,
      references: {
        ...(metadata.references || {}),
        ipdbId,
        ipdbMachineUrl: discovery.ipdbMachineUrl,
      },
      manuals: discovery.manuals,
      enrichment: {
        ...(metadata.enrichment || {}),
        manualsSource: "ipdb",
        manualsFetchStatus: discovery.manualsFetchStatus,
        manualsFetchedAt: discovery.manualsFetchedAt,
      },
    };

    metadata = await saveMetadata(metadata);
  }

  return metadata;
}

function buildManualContext(metadata = {}) {
  return {
    manuals: Array.isArray(metadata.manuals) ? metadata.manuals : [],
    manualsSource: metadata.enrichment?.manualsSource || null,
    manualsFetchStatus: metadata.enrichment?.manualsFetchStatus || null,
    manualsFetchedAt: metadata.enrichment?.manualsFetchedAt || null,
    ipdbMachineUrl: metadata.references?.ipdbMachineUrl || null,
  };
}

function buildServiceSignals() {
  return {
    enabled: false,
    hasModelHistory: false,
    notes: [],
  };
}

function buildEnhancements() {
  return {
    summary: null,
    tags: [],
  };
}

function extractRawOpdbId(machineId, metadata) {
  const rawFromMetadata =
    metadata?.references?.opdbId ||
    metadata?.opdbId ||
    metadata?.opdb_id ||
    null;

  if (rawFromMetadata) {
    return rawFromMetadata;
  }

  if (typeof machineId === "string" && machineId.startsWith("opdb:")) {
    return machineId.slice(5);
  }

  return machineId;
}

export async function buildMachineEnrichmentContext(machineId, options = {}) {
  if (!machineId) {
    throw new Error("machineId is required");
  }

  const includeKnowledgeIndex = options.includeKnowledgeIndex !== false;
  const includeServiceSignals = options.includeServiceSignals === true;
  const includeEnhancements = options.includeEnhancements === true;

  const canonicalMachineId =
    typeof machineId === "string" && machineId.startsWith("opdb:")
      ? machineId
      : buildMachineId(machineId);

  const existingMetadata = await getMetadata(canonicalMachineId);
  const rawOpdbId = extractRawOpdbId(machineId, existingMetadata);

  console.log("ENRICH canonicalMachineId:", canonicalMachineId);
  console.log("ENRICH rawOpdbId:", rawOpdbId);



  const machineDetails = await opdbDetailService(rawOpdbId);
  const machine = normalizeMachine(machineDetails);

  const metadata = await ensureMetadata(machine);

  const knowledgeIndex = includeKnowledgeIndex
    ? buildKnowledgeIndex(metadata)
    : null;

  return {
    machine: {
      opdb_id: machine.opdb_id || null,
      name: machine.name || null,
      manufacturer: machine.manufacturer || null,
      manufacturer_full_name: machine.manufacturer_full_name || null,
      display: machine.display || null,
      player_count: machine.player_count || null,
      type: machine.type || null,
      manufacture_date: machine.manufacture_date || null,
      shortname: machine.shortname || null,
      common_name: machine.common_name || null,
      features: Array.isArray(machine.features) ? machine.features : [],
      keywords: Array.isArray(machine.keywords) ? machine.keywords : [],
      ipdb_id: machine.ipdb_id || null,
      primary_image: machine.primary_image || null,
      description: machine.description || "",
    },
    metadata,
    knowledgeIndex,
    manualContext: buildManualContext(metadata),
    serviceSignals: includeServiceSignals ? buildServiceSignals() : null,
    enhancements: includeEnhancements ? buildEnhancements() : null,
    generatedAt: new Date().toISOString(),
  };
}
