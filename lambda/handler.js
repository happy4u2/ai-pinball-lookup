import { opdbService } from "./scripts/opdbService.js";

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

    return response(200, {
      source: "opdb-search",
      query: machineName,
      resultCount: results.length,
      results
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