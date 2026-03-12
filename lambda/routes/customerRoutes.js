import {
  createCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
} from "../scripts/customerService.js";
import { getPathId, jsonResponse } from "./routeUtils.js";

export async function handleCustomerRoutes({ httpMethod, path, body }) {
  if (httpMethod === "POST" && path === "/customers") {
    const result = await createCustomer(body);
    return jsonResponse(201, result);
  }

  if (httpMethod === "GET" && path === "/customers") {
    const result = await listCustomers();
    return jsonResponse(200, result);
  }

  if (httpMethod === "GET" && path.startsWith("/customers/")) {
    const customerId = getPathId(path, "/customers");

    if (!customerId) {
      return jsonResponse(400, { error: "Missing customerId" });
    }

    const result = await getCustomer(customerId);

    if (!result) {
      return jsonResponse(404, { error: "Customer not found" });
    }

    return jsonResponse(200, {
      ok: true,
      customer: result,
    });
  }

  if (httpMethod === "PUT" && path.startsWith("/customers/")) {
    const customerId = getPathId(path, "/customers");

    if (!customerId) {
      return jsonResponse(400, { error: "Missing customerId" });
    }

    const result = await updateCustomer(customerId, body);

    if (!result) {
      return jsonResponse(404, { error: "Customer not found" });
    }

    return jsonResponse(200, result);
  }

  return null;
}
