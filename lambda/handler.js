import { opdbService } from "./scripts/opdbService.js";
import { opdbDetailService } from "./scripts/opdbDetailService.js";
import { normalizeMachine } from "./scripts/normalizeMachine.js";
import { getCachedMachine, saveCachedMachine } from "./scripts/cacheService.js";
import { resolveMatch } from "./scripts/resolveMatch.js";
import { getMetadata, saveMetadata } from "./scripts/metadataService.js";
import { createMetadataShell } from "./scripts/metadataMapper.js";
import { mergeMachineData } from "./scripts/mergeMachineData.js";
import { buildMachineId } from "./scripts/metadataKeys.js";
import { discoverIpdbManuals } from "./scripts/ipdbManualService.js";
import { updateMetadataRecord } from "./scripts/updateMetadataRecord.js";
import {
  createCustomer,
  getCustomer,
  listCustomers,
} from "./scripts/customerService.js";

function normalizeCacheKey(text) {
  return (text || "").trim().toLowerCase();
}

async function enrichWithMetadata(machine) {
  const metadataMachineId = buildMachineId(machine.opdb_id || machine.id);

  let metadata = await getMetadata(metadataMachineId);

  if (!metadata) {
    metadata = createMetadataShell(machine);
    metadata = await saveMetadata(metadata);
    console.log("Created metadata shell:", metadataMachineId);
  }

  const hasManuals =
    Array.isArray(metadata.manuals) && metadata.manuals.length > 0;
  const ipdbId =
    metadata.references?.ipdbId || machine.ipdb_id || metadata.ipdbId || null;

  if (!hasManuals && ipdbId) {
    console.log("Attempting IPDB manual discovery for:", ipdbId);

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

    console.log("IPDB manual discovery status:", discovery.manualsFetchStatus);
  }

  return mergeMachineData(machine, metadata);
}

export const handler = async (event) => {
  try {
    console.log("Raw event:", JSON.stringify(event));

    let body = {};

    if (event.body) {
      body =
        typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    } else {
      body = event;
    }
    const httpMethod = event.httpMethod || "GET";
    const action = body.action || null;
    const searchQuery = event.queryStringParameters?.q;
    if (httpMethod === "POST" && event.rawPath === "/customers") {
      const customer = await createCustomer(body);

      return response(200, {
        ok: true,
        customer,
      });
    }
    if (httpMethod === "GET" && event.rawPath === "/customers") {
      const customers = await listCustomers();

      return response(200, {
        ok: true,
        customers,
      });
    }

    if (httpMethod === "POST" && action === "updateMetadata") {
      const metadataMachineId = body.machineId;

      if (!metadataMachineId) {
        return response(400, {
          error: "Missing machineId",
        });
      }

      let metadata = await getMetadata(metadataMachineId);

      if (!metadata) {
        return response(404, {
          error: "Metadata record not found",
          machineId: metadataMachineId,
        });
      }

      metadata = updateMetadataRecord(metadata, body);
      metadata = await saveMetadata(metadata);

      return response(200, {
        ok: true,
        machineId: metadataMachineId,
        updatedMetadata: metadata,
      });
    }

    const machineName =
      body.machineName ||
      event.queryStringParameters?.name ||
      event.queryStringParameters?.machineName;

    const machineId = body.id || event.queryStringParameters?.id;

    if (!machineName && !machineId && !searchQuery) {
      return response(400, { error: "Missing machineName, id, or q" });
    }

    // Typeahead search
    if (searchQuery) {
      console.log("Typeahead search:", searchQuery);

      const results = await opdbService(searchQuery);

      const suggestions = results.slice(0, 10).map((item) => ({
        id: item.id,
        text: item.text,
        name: item.name,
        supplementary: item.supplementary,
        display: item.display,
      }));

      return response(200, {
        mode: "typeahead",
        query: searchQuery,
        suggestions,
      });
    }

    // Exact machine lookup by OPDB ID
    if (machineId) {
      const idCacheKey = `id:${machineId}`;
      console.log("Checking ID cache for:", idCacheKey);

      const cached = await getCachedMachine(idCacheKey);

      if (cached) {
        console.log("ID cache hit for:", idCacheKey);

        const enrichedMachine = await enrichWithMetadata(cached.result);

        return response(200, {
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

      console.log("Direct machine lookup by ID:", machineId);

      const machineDetails = await opdbDetailService(machineId);
      const normalizedResult = normalizeMachine(machineDetails);
      const enrichedMachine = await enrichWithMetadata(normalizedResult);

      const supplementary = [
        machineDetails.manufacturer?.name,
        machineDetails.manufacture_date?.slice(0, 4),
      ]
        .filter(Boolean)
        .join(", ");

      const payload = {
        source: "opdb-machine",
        query: machineDetails.name,
        selectedMatch: {
          id: machineDetails.opdb_id,
          text: machineDetails.name,
          name: machineDetails.name,
          supplementary: supplementary || null,
          display: machineDetails.display || null,
        },
        result: enrichedMachine,
      };

      await saveCachedMachine(`id:${machineDetails.opdb_id}`, payload);
      console.log(
        "Saved ID-based cache entry:",
        `id:${machineDetails.opdb_id}`,
      );

      return response(200, {
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

    // Safe exact-name cache read only
    const nameCacheKey = `name:${normalizeCacheKey(machineName)}`;
    console.log("Checking exact-name cache for:", nameCacheKey);

    const cachedByName = await getCachedMachine(nameCacheKey);

    if (cachedByName) {
      console.log("Exact-name cache hit for:", nameCacheKey);

      const enrichedMachine = await enrichWithMetadata(cachedByName.result);

      return response(200, {
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

    console.log("Cache miss. Searching OPDB for:", machineName);

    const primaryResults = await opdbService(machineName);
    console.log(
      "Primary OPDB results:",
      JSON.stringify(primaryResults, null, 2),
    );

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

    console.log("Combined OPDB results:", JSON.stringify(results, null, 2));

    if (!results.length) {
      return response(404, {
        mode: "not_found",
        error: "Machine not found",
        query: machineName,
        matches: [],
      });
    }

    const matchResolution = resolveMatch(machineName, results);

    if (matchResolution.mode === "disambiguation") {
      console.log("Disambiguation required for:", machineName);

      return response(200, {
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
      console.log("Reusing ID cache for:", idCacheKey);

      const enrichedMachine = await enrichWithMetadata(cached.result);

      return response(200, {
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

    console.log("Selected OPDB match:", bestMatch);

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
    console.log("Saved resolved ID cache entry:", `id:${bestMatch.id}`);

    console.log("Skipping exact-name cache write:", {
      machineName,
      selectedName: bestMatch.name,
    });

    return response(200, {
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
  } catch (error) {
    console.error("Handler error:", error);

    return response(500, {
      error: "Internal server error",
      message: error.message,
    });
  }
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}
