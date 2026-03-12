import {
  createServiceRecord,
  getServiceRecord,
  listServiceRecordsByInstance,
  updateServiceRecord,
  getServiceTimelineByInstance,
} from "../scripts/serviceRecordService.js";
import { getPathId, jsonResponse } from "./routeUtils.js";

export async function handleServiceRecordRoutes({ httpMethod, path, body }) {
  if (httpMethod === "POST" && path === "/service-records") {
    if (!body?.instanceId) {
      return jsonResponse(400, { error: "instanceId is required" });
    }

    const serviceRecord = await createServiceRecord(body);

    return jsonResponse(201, {
      ok: true,
      serviceRecord,
    });
  }

  if (httpMethod === "GET" && path.startsWith("/service-records/")) {
    const serviceId = getPathId(path, "/service-records/");

    if (!serviceId) {
      return jsonResponse(400, { error: "Missing serviceId" });
    }

    const serviceRecord = await getServiceRecord(serviceId);

    if (!serviceRecord) {
      return jsonResponse(404, { error: "Service record not found" });
    }

    return jsonResponse(200, {
      ok: true,
      serviceRecord,
    });
  }

  if (httpMethod === "PUT" && path.startsWith("/service-records/")) {
    const serviceId = getPathId(path, "/service-records/");

    if (!serviceId) {
      return jsonResponse(400, { error: "Missing serviceId" });
    }

    try {
      const serviceRecord = await updateServiceRecord(serviceId, body || {});

      return jsonResponse(200, {
        ok: true,
        serviceRecord,
      });
    } catch (error) {
      if (error.name === "ConditionalCheckFailedException") {
        return jsonResponse(404, { error: "Service record not found" });
      }

      return jsonResponse(400, { error: error.message });
    }
  }

  if (
    httpMethod === "GET" &&
    path.startsWith("/instances/") &&
    path.endsWith("/history")
  ) {
    const match = path.match(/^\/instances\/([^/]+)\/history$/);

    if (!match?.[1]) {
      return jsonResponse(400, { error: "Missing instanceId" });
    }

    const instanceId = match[1];
    const history = await getServiceTimelineByInstance(instanceId);

    return jsonResponse(200, {
      ok: true,
      instanceId,
      count: history.length,
      history,
    });
  }

  if (
    httpMethod === "GET" &&
    path.startsWith("/instances/") &&
    path.endsWith("/service-records")
  ) {
    const match = path.match(/^\/instances\/([^/]+)\/service-records$/);

    if (!match?.[1]) {
      return jsonResponse(400, { error: "Missing instanceId" });
    }

    const instanceId = match[1];
    const items = await listServiceRecordsByInstance(instanceId);

    return jsonResponse(200, {
      ok: true,
      count: items.length,
      items,
    });
  }

  return null;
}
