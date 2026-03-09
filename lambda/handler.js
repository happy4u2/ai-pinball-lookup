import { opdbService } from "./scripts/opdbService.js";
import { opdbDetailService } from "./scripts/opdbDetailService.js";
import { normalizeMachine } from "./scripts/normalizeMachine.js";
import { getCachedMachine, saveCachedMachine } from "./scripts/cacheService.js";
import { selectBestMatch } from "./scripts/selectBestMatch.js";

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

    if (!machineName) {
      return response(400, { error: "Missing machineName" });
    }

    console.log("Checking DynamoDB cache for:", machineName);

    const cached = await getCachedMachine(machineName);

    if (cached) {
      console.log("Cache hit for:", machineName);

      return response(200, {
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

    const results = await opdbService(machineName);

    if (!results || results.length === 0) {
      return response(404, {
        error: "Machine not found",
        query: machineName,
        resultCount: 0,
        results: []
      });
    }

    const bestMatch = selectBestMatch(machineName, results);
    const machineId = bestMatch.id;

    console.log("Best OPDB match:", bestMatch);
    console.log("Fetching OPDB machine details for ID:", machineId);

    const machineDetails = await opdbDetailService(machineId);
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