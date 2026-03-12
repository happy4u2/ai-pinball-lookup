import {
  createInstance,
  getInstance,
  listInstances,
  listInstancesByCustomer,
  listInstancesByMachine,
  updateInstance,
} from "../scripts/instanceService.js";
import { getPathId } from "./routeUtils.js";

export async function handleInstanceRoutes({
  httpMethod,
  path,
  body,
  event,
  response,
}) {
  /*
  POST /instances
  */
  if (httpMethod === "POST" && path === "/instances") {
    const instance = await createInstance(body);

    return response(201, {
      ok: true,
      instance,
    });
  }

  /*
  GET /instances
  */
  if (httpMethod === "GET" && path === "/instances") {
    const customerId = event.queryStringParameters?.customerId;
    const machineId = event.queryStringParameters?.machineId;

    let items;

    if (customerId) {
      items = await listInstancesByCustomer(customerId);
    } else if (machineId) {
      items = await listInstancesByMachine(machineId);
    } else {
      items = await listInstances();
    }

    return response(200, {
      ok: true,
      count: items.length,
      items,
    });
  }

  /*
  GET /instances/{id}
  */
  if (httpMethod === "GET" && path.startsWith("/instances/")) {
    const instanceId = getPathId(path, "/instances");

    if (!instanceId) {
      return response(400, { error: "Missing instanceId" });
    }

    const instance = await getInstance(instanceId);

    if (!instance) {
      return response(404, {
        error: "Instance not found",
      });
    }

    return response(200, {
      ok: true,
      instance,
    });
  }

  /*
  PUT /instances/{id}
  */
  if (httpMethod === "PUT" && path.startsWith("/instances/")) {
    const instanceId = getPathId(path, "/instances");

    if (!instanceId) {
      return response(400, { error: "Missing instanceId" });
    }

    const instance = await updateInstance(instanceId, body);

    if (!instance) {
      return response(404, { error: "Instance not found" });
    }

    return response(200, {
      ok: true,
      instance,
    });
  }

  return null;
}
