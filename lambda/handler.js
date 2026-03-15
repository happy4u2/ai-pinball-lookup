import { handleCustomerRoutes } from "./routes/customerRoutes.js";
import { handleInstanceRoutes } from "./routes/instanceRoutes.js";
import { handleMachineRoutes } from "./routes/machineRoutes.js";
import { handleServiceRecordRoutes } from "./routes/serviceRecordRoutes.js";
import { jsonResponse } from "./routes/routeUtils.js";

function normalizePath(event) {
  const rawPath = event.rawPath || event.path || "/";
  const stage = event.requestContext?.stage;

  if (stage && rawPath === `/${stage}`) {
    return "/";
  }

  if (stage && rawPath.startsWith(`/${stage}/`)) {
    return rawPath.slice(stage.length + 1);
  }

  return rawPath;
}

export const handler = async (event) => {
  try {
    console.log("Raw event:", JSON.stringify(event));

    const httpMethod =
      event.requestContext?.http?.method || event.httpMethod || "GET";

    if (httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        },
        body: "",
      };
    }

    const body = event.body
      ? typeof event.body === "string"
        ? JSON.parse(event.body)
        : event.body
      : {};

    const rawPath =
      event.rawPath || event.requestContext?.http?.path || event.path || "/";

    const path = normalizePath(event);
    const query = event.queryStringParameters || {};

    const ctx = {
      event,
      body,
      httpMethod,
      path,
      query,
    };

    let result = await handleCustomerRoutes(ctx);
    if (result) return result;

    result = await handleServiceRecordRoutes(ctx);
    if (result) return result;

    result = await handleInstanceRoutes(ctx);
    if (result) return result;

    result = await handleMachineRoutes(ctx);
    if (result) return result;

    return jsonResponse(404, {
      error: "Route not found",
      method: httpMethod,
      path,
      rawPath,
    });
  } catch (error) {
    console.error("Handler error:", error);

    return jsonResponse(500, {
      error: "Internal server error",
      message: error.message,
    });
  }
};
