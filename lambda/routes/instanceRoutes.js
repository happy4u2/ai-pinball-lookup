import {
  createInstance,
  getInstance,
  listInstances,
  listInstancesByCustomer,
  listInstancesByMachine,
  updateInstance,
} from "../scripts/instanceService.js";
import { getPathId, jsonResponse } from "./routeUtils.js";

export async function handleInstanceRoutes({ httpMethod, path, body, query }) {
  /*
  POST /instances
  */
  if (httpMethod === "POST" && path === "/instances") {
    try {
      const instance = await createInstance(body || {});

      return jsonResponse(201, {
        ok: true,
        instance,
      });
    } catch (error) {
      return jsonResponse(400, {
        ok: false,
        error: error.message || "Failed to create instance",
      });
    }
  }

  /*
  GET /instances
  */
  if (httpMethod === "GET" && path === "/instances") {
    try {
      const customerId = query?.customerId;
      const machineId = query?.machineId;

      let items;

      if (customerId) {
        items = await listInstancesByCustomer(customerId);
      } else if (machineId) {
        items = await listInstancesByMachine(machineId);
      } else {
        items = await listInstances();
      }

      return jsonResponse(200, {
        ok: true,
        count: items.length,
        items,
      });
    } catch (error) {
      return jsonResponse(500, {
        ok: false,
        error: error.message || "Failed to list instances",
      });
    }
  }

  /*
  GET /instances/{id}
  Exclude:
  - /instances/{id}/service-records
  - /instances/{id}/history
  */
  if (
    httpMethod === "GET" &&
    path.startsWith("/instances/") &&
    !path.endsWith("/service-records") &&
    !path.endsWith("/history")
  ) {
    try {
      const instanceId = getPathId(path, "/instances");

      if (!instanceId) {
        return jsonResponse(400, { ok: false, error: "Missing instanceId" });
      }

      const instance = await getInstance(instanceId);

      if (!instance) {
        return jsonResponse(404, {
          ok: false,
          error: "Instance not found",
        });
      }

      return jsonResponse(200, {
        ok: true,
        instance,
      });
    } catch (error) {
      return jsonResponse(500, {
        ok: false,
        error: error.message || "Failed to load instance",
      });
    }
  }

  /*
  PUT /instances/{id}
  Exclude:
  - /instances/{id}/service-records
  - /instances/{id}/history
  */
  if (
    httpMethod === "PUT" &&
    path.startsWith("/instances/") &&
    !path.endsWith("/service-records") &&
    !path.endsWith("/history")
  ) {
    try {
      const instanceId = getPathId(path, "/instances");

      if (!instanceId) {
        return jsonResponse(400, { ok: false, error: "Missing instanceId" });
      }

      const instance = await updateInstance(instanceId, body || {});

      if (!instance) {
        return jsonResponse(404, {
          ok: false,
          error: "Instance not found",
        });
      }

      return jsonResponse(200, {
        ok: true,
        instance,
      });
    } catch (error) {
      if (error.message === "Instance not found") {
        return jsonResponse(404, {
          ok: false,
          error: error.message,
        });
      }

      return jsonResponse(400, {
        ok: false,
        error: error.message || "Failed to update instance",
      });
    }
  }

  return null;
}