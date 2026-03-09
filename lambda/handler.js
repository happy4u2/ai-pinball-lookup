import { opdbService } from "./scripts/opdbService.js";
import { opdbDetailService } from "./scripts/opdbDetailService.js";
import { normalizeMachine } from "./scripts/normalizeMachine.js";
import { getCachedMachine, saveCachedMachine } from "./scripts/cacheService.js";
import { resolveMatch } from "./scripts/resolveMatch.js";

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

  // Save the exact chosen machine to DynamoDB
  await saveCachedMachine(machineDetails.name, payload);

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

    console.log("Checking DynamoDB cache for:", machineName);

    const cached = await getCachedMachine(machineName);

    if (cached) {
      console.log("Cache hit for:", machineName);

      return response(200, {
        mode: "result",
        source: cached.source,
        query: cached.query,
        selectedMatch: cached.selectedMatch,
        result: cached.result,
        cache: {
          hit: true,
          cachedAt: cached.cachedAt
        }
      });
    }

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

    await saveCachedMachine(machineName, payload);

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