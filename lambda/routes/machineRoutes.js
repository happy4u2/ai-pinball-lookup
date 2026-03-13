import { opdbService } from "../scripts/opdbService.js";
import { opdbDetailService } from "../scripts/opdbDetailService.js";
import { normalizeMachine } from "../scripts/normalizeMachine.js";
import {
  getCachedMachine,
  saveCachedMachine,
} from "../scripts/cacheService.js";
import { resolveMatch } from "../scripts/resolveMatch.js";
import { getMetadata, saveMetadata } from "../scripts/metadataService.js";
import { createMetadataShell } from "../scripts/metadataMapper.js";
import { mergeMachineData } from "../scripts/mergeMachineData.js";
import { buildMachineId } from "../scripts/metadataKeys.js";
import { discoverIpdbManuals } from "../scripts/ipdbManualService.js";
import { updateMetadataRecord } from "../scripts/updateMetadataRecord.js";
import { buildKnowledgeIndex } from "../scripts/buildKnowledgeIndex.js";
import { jsonResponse } from "./routeUtils.js";

function extractKnowledgeIndexPathId(path) {
  const match = path.match(/^\/machine\/([^/]+)\/knowledge-index$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function normalizeCacheKey(text) {
  return (text || "").trim().toLowerCase();
}

async function enrichWithMetadata(machine) {
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

  return mergeMachineData(machine, metadata);
}

export async function handleMachineRoutes({ httpMethod, path, body, query }) {
  const action = body?.action || null;
  const searchQuery = query?.q;
  const knowledgeIndexMachineId = extractKnowledgeIndexPathId(path);

  if (
    httpMethod === "POST" &&
    path === "/machine" &&
    action === "updateMetadata"
  ) {
    const metadataMachineId = body?.machineId;

    if (!metadataMachineId) {
      return jsonResponse(400, { error: "Missing machineId" });
    }

    let metadata = await getMetadata(metadataMachineId);

    if (!metadata) {
      return jsonResponse(404, {
        error: "Metadata record not found",
        machineId: metadataMachineId,
      });
    }

    metadata = updateMetadataRecord(metadata, body);
    metadata = await saveMetadata(metadata);

    return jsonResponse(200, {
      ok: true,
      machineId: metadataMachineId,
      updatedMetadata: metadata,
    });
  }

  if (httpMethod === "GET" && knowledgeIndexMachineId) {
    const metadata = await getMetadata(knowledgeIndexMachineId);

    if (!metadata) {
      return jsonResponse(404, {
        ok: false,
        error: "Metadata record not found",
        machineId: knowledgeIndexMachineId,
      });
    }

    const knowledgeIndex = buildKnowledgeIndex(metadata);

    return jsonResponse(200, {
      ok: true,
      machineId: knowledgeIndexMachineId,
      knowledgeIndex,
    });
  }

  if (path !== "/machine") {
    return null;
  }

  const machineName = body?.machineName || query?.name || query?.machineName;
  const machineId = body?.id || query?.id;

  if (!machineName && !machineId && !searchQuery) {
    return jsonResponse(400, { error: "Missing machineName, id, or q" });
  }

  if (searchQuery) {
    const results = await opdbService(searchQuery);

    const suggestions = results.slice(0, 10).map((item) => ({
      id: item.id,
      text: item.text,
      name: item.name,
      supplementary: item.supplementary,
      display: item.display,
    }));

    return jsonResponse(200, {
      mode: "typeahead",
      query: searchQuery,
      suggestions,
    });
  }

  if (machineId) {
    const idCacheKey = `id:${machineId}`;
    const cached = await getCachedMachine(idCacheKey);

    if (cached) {
      const enrichedMachine = await enrichWithMetadata(cached.result);

      return jsonResponse(200, {
        mode: "result",
        source: cached.source,
        query: cached.query,
        selectedMatch: cached.selectedMatch,
        result: enrichedMachine,
        cache: {
          hit: true,
          cachedAt: cached.cachedAt,
        },
      });
    }

    const machineDetails = await opdbDetailService(machineId);
    const normalizedResult = normalizeMachine(machineDetails);
    const enrichedMachine = await enrichWithMetadata(normalizedResult);

    const payload = {
      source: "opdb-machine",
      query: machineDetails.name,
      selectedMatch: {
        id: machineDetails.opdb_id,
        text: machineDetails.name,
        name: machineDetails.name,
        supplementary: null,
        display: machineDetails.display || null,
      },
      result: enrichedMachine,
    };

    await saveCachedMachine(`id:${machineDetails.opdb_id}`, payload);

    return jsonResponse(200, {
      mode: "result",
      source: payload.source,
      query: machineDetails.name,
      selectedMatch: payload.selectedMatch,
      result: payload.result,
      cache: {
        hit: false,
        cachedAt: null,
      },
    });
  }

  const nameCacheKey = `name:${normalizeCacheKey(machineName)}`;
  const cachedByName = await getCachedMachine(nameCacheKey);

  if (cachedByName) {
    const enrichedMachine = await enrichWithMetadata(cachedByName.result);

    return jsonResponse(200, {
      mode: "result",
      source: cachedByName.source,
      query: cachedByName.query,
      selectedMatch: cachedByName.selectedMatch,
      result: enrichedMachine,
      cache: {
        hit: true,
        cachedAt: cachedByName.cachedAt,
      },
    });
  }

  const primaryResults = await opdbService(machineName);
  let results = [...primaryResults];

  if (!machineName.toLowerCase().startsWith("the ")) {
    const altQuery = `The ${machineName}`;
    const altResults = await opdbService(altQuery);

    const seen = new Set(results.map((r) => r.id));

    for (const item of altResults) {
      if (!seen.has(item.id)) {
        results.push(item);
        seen.add(item.id);
      }
    }
  }

  if (!results.length) {
    return jsonResponse(404, {
      mode: "not_found",
      error: "Machine not found",
      query: machineName,
      matches: [],
    });
  }

  const matchResolution = resolveMatch(machineName, results);

  if (matchResolution.mode === "disambiguation") {
    return jsonResponse(200, {
      mode: "disambiguation",
      query: machineName,
      matches: matchResolution.matches,
      cache: {
        hit: false,
        cachedAt: null,
      },
    });
  }

  const bestMatch = matchResolution.selectedMatch;
  const idCacheKey = `id:${bestMatch.id}`;
  const cached = await getCachedMachine(idCacheKey);

  if (cached) {
    const enrichedMachine = await enrichWithMetadata(cached.result);

    return jsonResponse(200, {
      mode: "result",
      source: cached.source,
      query: machineName,
      selectedMatch: cached.selectedMatch,
      result: enrichedMachine,
      cache: {
        hit: true,
        cachedAt: cached.cachedAt,
      },
    });
  }

  const machineDetails = await opdbDetailService(bestMatch.id);
  const normalizedResult = normalizeMachine(machineDetails);
  const enrichedMachine = await enrichWithMetadata(normalizedResult);

  const payload = {
    source: "opdb-machine",
    query: bestMatch.name,
    selectedMatch: {
      id: bestMatch.id,
      text: bestMatch.text,
      name: bestMatch.name,
      supplementary: bestMatch.supplementary,
      display: bestMatch.display,
    },
    result: enrichedMachine,
  };

  await saveCachedMachine(`id:${bestMatch.id}`, payload);

  return jsonResponse(200, {
    mode: "result",
    source: payload.source,
    query: machineName,
    selectedMatch: payload.selectedMatch,
    result: payload.result,
    cache: {
      hit: false,
      cachedAt: null,
    },
  });
}
