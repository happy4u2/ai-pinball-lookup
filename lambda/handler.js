import { jsonResponse } from "./lib/response.js";
import { normalizeMachineName } from "./lib/normalize.js";

export const handler = async (event = {}) => {
  try {
    const body = parseBody(event.body);
    const machineName =
      body.machineName ??
      event?.queryStringParameters?.machineName ??
      event?.queryStringParameters?.name ??
      "";

    const normalizedName = normalizeMachineName(machineName);

    if (!normalizedName) {
      return jsonResponse(400, {
        error: "Missing machineName",
        message: "Provide a machineName in the JSON body or query string."
      });
    }

    return jsonResponse(200, {
      source: "lambda-mvp",
      result: {
        query: machineName,
        normalized_query: normalizedName,
        status: "accepted",
        next_step: "Wire OPDB lookup service"
      }
    });
  } catch (error) {
    return jsonResponse(500, {
      error: "InternalServerError",
      message: error.message || "Unexpected error"
    });
  }
};

function parseBody(body) {
  if (!body) {
    return {};
  }

  if (typeof body === "string") {
    return JSON.parse(body);
  }

  if (typeof body === "object") {
    return body;
  }

  return {};
}
