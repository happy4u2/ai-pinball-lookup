const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

async function handleResponse(response) {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }
  return response.json();
}

async function apiGet(path) {
  const response = await fetch(`${API_BASE}${path}`);
  return handleResponse(response);
}

async function apiPost(path, payload) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

async function apiPut(path, payload) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

// --------------------
// MACHINES
// --------------------

export async function searchMachineCandidates(query) {
  return apiGet(`/machine?q=${encodeURIComponent(query)}`);
}

export async function searchMachineByName(query) {
  return apiGet(`/machine?name=${encodeURIComponent(query)}`);
}

export async function getMachineById(machineId) {
  return apiGet(`/machine?id=${encodeURIComponent(machineId)}`);
}

export async function getMachine(machineId) {
  return getMachineById(machineId);
}

export async function getEnrichedMachineById(machineId) {
  return apiGet(`/machine/enriched?id=${encodeURIComponent(machineId)}`);
}

export async function updateMachineMetadata(payload) {
  return apiPost(`/machine`, payload);
}

// --------------------
// CUSTOMERS
// --------------------

export async function listCustomers() {
  return apiGet(`/customers`);
}

export async function getCustomerById(customerId) {
  return apiGet(`/customers/${encodeURIComponent(customerId)}`);
}

export async function getCustomer(customerId) {
  return getCustomerById(customerId);
}

export async function createCustomer(customerData) {
  const payload = {
    name: `${customerData.firstName || ""} ${customerData.lastName || ""}`.trim(),
    firstName: customerData.firstName || "",
    lastName: customerData.lastName || "",
    phone: customerData.phone || "",
    email: customerData.email || "",
    address: [
      customerData.addressLine1 || "",
      customerData.postalCode || "",
      customerData.city || "",
    ]
      .filter(Boolean)
      .join(", "),
    addressLine1: customerData.addressLine1 || "",
    postalCode: customerData.postalCode || "",
    city: customerData.city || "",
    notes: customerData.notes || "",
  };

  return apiPost(`/customers`, payload);
}

export async function updateCustomer(customerId, payload) {
  return apiPut(`/customers/${encodeURIComponent(customerId)}`, payload);
}

// --------------------
// INSTANCES
// --------------------

export async function listInstances(filters = {}) {
  const params = new URLSearchParams();

  if (filters.customerId) {
    params.set("customerId", filters.customerId);
  }

  if (filters.machineId) {
    params.set("machineId", filters.machineId);
  }

  const query = params.toString();
  return apiGet(`/instances${query ? `?${query}` : ""}`);
}

export async function getInstanceById(instanceId) {
  return apiGet(`/instances/${encodeURIComponent(instanceId)}`);
}

export async function getInstance(instanceId) {
  return getInstanceById(instanceId);
}

export async function createInstance(payload) {
  return apiPost(`/instances`, payload);
}

export async function updateInstance(instanceId, payload) {
  return apiPut(`/instances/${encodeURIComponent(instanceId)}`, payload);
}

export async function getInstanceHistory(instanceId) {
  return apiGet(`/instances/${encodeURIComponent(instanceId)}/history`);
}

// --------------------
// SERVICE RECORDS
// --------------------

export async function getServiceRecordById(serviceId) {
  return apiGet(`/service-records/${encodeURIComponent(serviceId)}`);
}

export async function getServiceRecord(serviceId) {
  return getServiceRecordById(serviceId);
}

export async function createServiceRecord(payload) {
  return apiPost(`/service-records`, payload);
}

export async function updateServiceRecord(serviceId, payload) {
  return apiPut(`/service-records/${encodeURIComponent(serviceId)}`, payload);
}