import {
  createServiceRecord,
  getServiceRecord,
  listServiceRecordsByInstance,
} from "../scripts/serviceRecordService.js";
import { getPathId } from "./routeUtils.js";

export async function handleServiceRecordRoutes({
  httpMethod,
  path,
  body,
  response,
}) {
  /*
  POST /service-records
  */
  if (httpMethod === "POST" && path === "/service-records") {
    if (!body?.instanceId) {
      return response(400, { error: "instanceId is required" });
    }

    const serviceRecord = await createServiceRecord(body);

    return response(201, {
      ok: true,
      serviceRecord,
    });
  }

  /*
  GET /service-records/{id}
  */
  if (httpMethod === "GET" && path.startsWith("/service-records/")) {
    const serviceId = getPathId(path, "/service-records");

    if (!serviceId) {
      return response(400, { error: "Missing serviceId" });
    }

    const serviceRecord = await getServiceRecord(serviceId);

    if (!serviceRecord) {
      return response(404, { error: "Service record not found" });
    }

    return response(200, {
      ok: true,
      serviceRecord,
    });
  }

  /*
  GET /instances/{id}/service-records
  */
  if (
    httpMethod === "GET" &&
    path.startsWith("/instances/") &&
    path.endsWith("/service-records")
  ) {
    const match = path.match(/^\/instances\/([^/]+)\/service-records$/);

    if (!match?.[1]) {
      return response(400, { error: "Missing instanceId" });
    }

    const instanceId = match[1];
    const items = await listServiceRecordsByInstance(instanceId);

    return response(200, {
      ok: true,
      count: items.length,
      items,
    });
  }

  return null;
}
