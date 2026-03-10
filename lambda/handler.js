import { opdbService } from "./scripts/opdbService.js";
import { opdbDetailService } from "./scripts/opdbDetailService.js";
import { normalizeMachine } from "./scripts/normalizeMachine.js";
import { saveCachedMachine } from "./scripts/cacheService.js";
import { resolveMatch } from "./scripts/resolveMatch.js";

function normalizeCacheKey(text) {
  return (text || "").trim().toLowerCase();
}

export const handler = async (event) => {
  try {
    console.log("Raw event:", JSON.stringify(event));

    let body = {};

    if (event.body) {
      body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    } else {
      body = event;
    }

    const machineName =
      body.machineName ||
      event.queryStringParameters?.name ||
      event.queryStringParameters?.machineName;

    const machineId =
      body.id ||
      event.queryStringParameters?.id;

    if (!machineName && !machineId) {
      return response(400, { error: "Missing machineName or id" });
    }

    // Exact machine lookup by OPDB ID
    if (machineId) {
      console.log("Direct machine lookup by ID:", machineId);

      const machineDetails = await opdbDetailService(machineId);
      const normalizedResult = normalizeMachine(machineDetails);

      const supplementary = [
        machineDetails.manufacturer?.name,
        machineDetails.manufacture_date?.slice(0, 4)
      ]
        .filter(Boolean)
        .join(", ");

      const payload = {
        source: "opdb-machine",
        selectedMatch: {
          id: machineDetails.opdb_id,
          text: machineDetails.name,
          name: machineDetails.name,
          supplementary: supplementary || null,
          display: machineDetails.display || null
        },
        result: normalizedResult
      };

      // Cache exact machine selections by OPDB ID only
      await saveCachedMachine(`id:${machineDetails.opdb_id}`, payload);
      console.log("Saved ID-based cache entry:", `id:${machineDetails.opdb_id}`);

      return response(200, {
        mode: "result",
        source: payload.source,
        query: machineName || machineDetails.name,
        selectedMatch: payload.selectedMatch,
        result: payload.result,
        cache: {
          hit: false,
          cachedAt: null
        }
      });
    }

    // IMPORTANT:
    // Name-based cache reads are intentionally disabled for now.
    // This prevents broad family titles like "Jurassic Park"
    // from returning a poisoned cached exact machine result.
    console.log("Skipping name-based cache read for:", machineName);

    console.log("Cache miss. Searching OPDB for:", machineName);

    const primaryResults = await opdbService(machineName);
    console.log("Primary OPDB results:", JSON.stringify(primaryResults, null, 2));

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
        matches: []
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
          cachedAt: null
        }
      });
    }

    const bestMatch = matchResolution.selectedMatch;
    console.log("Selected OPDB match:", bestMatch);

    const machineDetails = await opdbDetailService(bestMatch.id);
    const normalizedResult = normalizeMachine(machineDetails);

    const payload = {
      source: "opdb-machine",
      selectedMatch: {
        id: bestMatch.id,
        text: bestMatch.text,
        name: bestMatch.name,
        supplementary: bestMatch.supplementary,
        display: bestMatch.display
      },
      result: normalizedResult
    };

    // Only cache exact-name matches.
    // Do NOT cache broad ambiguous family searches like "Jurassic Park"
    // when they resolve to a more specific machine.
    const queryKey = normalizeCacheKey(machineName);
    const selectedKey = normalizeCacheKey(bestMatch.name);

    if (queryKey === selectedKey) {
      await saveCachedMachine(`name:${selectedKey}`, payload);
      console.log("Saved exact-name result to cache:", `name:${selectedKey}`);
    } else {
      console.log(
        "Skipped caching broad query because selected machine differs:",
        { machineName, selectedName: bestMatch.name }
      );
    }

    return response(200, {
      mode: "result",
      source: payload.source,
      query: machineName,
      selectedMatch: payload.selectedMatch,
      result: payload.result,
      cache: {
        hit: false,
        cachedAt: null
      }
    });
  } catch (error) {
    console.error("Handler error:", error);

    return response(500, {
      error: "Internal server error",
      message: error.message
    });
  }
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(body)
  };
}