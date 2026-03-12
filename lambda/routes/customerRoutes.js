import {
  createCustomer,
  listCustomers,
  getCustomer,
  updateCustomer,
} from "../scripts/customerService.js";
import { getPathId } from "./routeUtils.js";

export async function handleCustomerRoutes({
  httpMethod,
  path,
  body,
  response,
}) {
  /*
  POST /customers
  */
  if (httpMethod === "POST" && path === "/customers") {
    const result = await createCustomer(body);
    return response(201, result);
  }

  /*
  GET /customers
  */
  if (httpMethod === "GET" && path === "/customers") {
    const result = await listCustomers();
    return response(200, result);
  }

  /*
  GET /customers/{id}
  */
  if (httpMethod === "GET" && path.startsWith("/customers/")) {
    const customerId = getPathId(path, "/customers");

    if (!customerId) {
      return response(400, { error: "Missing customerId" });
    }

    const result = await getCustomer(customerId);

    if (!result) {
      return response(404, { error: "Customer not found" });
    }

    return response(200, {
      ok: true,
      customer: result,
    });
  }

  /*
  PUT /customers/{id}
  */
  if (httpMethod === "PUT" && path.startsWith("/customers/")) {
    const customerId = getPathId(path, "/customers");

    if (!customerId) {
      return response(400, { error: "Missing customerId" });
    }

    const result = await updateCustomer(customerId, body);

    if (!result) {
      return response(404, { error: "Customer not found" });
    }

    return response(200, result);
  }

  return null;
}
