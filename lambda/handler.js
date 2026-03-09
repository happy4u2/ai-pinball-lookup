import { opdbService } from "./scripts/opdbService.js";
import { opdbDetailService } from "./scripts/opdbDetailService.js";
import { normalizeMachine } from "./scripts/normalizeMachine.js";

export const handler = async (event) => {
  try {
    console.log("Raw event:", JSON.stringify(event));

    let body = {};

    if (event.body) {
      body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    } else {
      body = event;
    }

    const machineName = body.machineName;

    if (!machineName) {
      return response(400, { error: "Missing machineName" });
    }

    console.log("Searching OPDB for:", machineName);

    const results = await opdbService(machineName);

    if (!results || results.length === 0) {
      return response(404, {
        error: "Machine not found",
        query: machineName,
        resultCount: 0,
        results: []
      });
    }

    const bestMatch = results[0];
    const machineId = bestMatch.id;

    console.log("Best OPDB match:", bestMatch);
    console.log("Fetching OPDB machine details for ID:", machineId);

    const machineDetails = await opdbDetailService(machineId);
    const normalizedResult = normalizeMachine(machineDetails);

    return response(200, {
      source: "opdb-machine",
      query: machineName,
      selectedMatch: {
        id: bestMatch.id,
        text: bestMatch.text,
        name: bestMatch.name,
        supplementary: bestMatch.supplementary,
        display: bestMatch.display
      },
      result: normalizedResult
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