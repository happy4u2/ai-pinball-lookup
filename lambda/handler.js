import { opdbService } from "./opdbService.js";

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

export const handler = async (event) => {
  try {
    const body = event?.body ? JSON.parse(event.body) : {};
    const machineName =
      body.machineName ||
      event?.queryStringParameters?.machineName ||
      event?.queryStringParameters?.name;

    if (!machineName) {
      return response(400, { error: "Missing machineName" });
    }

    const results = await opdbService(machineName);

    if (!results || results.length === 0) {
      return response(404, {
        error: "No machine found",
        query: machineName
      });
    }

    return response(200, {
      source: "opdb-search",
      query: machineName,
      resultCount: results.length,
      results
    });
  } catch (error) {
    console.error("Lambda error:", error);

    return response(500, {
      error: "Internal server error",
      message: error.message
    });
  }
};