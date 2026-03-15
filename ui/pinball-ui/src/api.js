const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function handleResponse(res, defaultMessage) {
  const contentType = res.headers.get("content-type") || "";

  let data;
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    data = { message: text };
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || `${defaultMessage}: ${res.status}`);
  }

  return data;
}

export async function searchMachineByName(name) {
  const url = `${API_BASE_URL}/machine?name=${encodeURIComponent(name)}`;
  const res = await fetch(url);

  return handleResponse(res, "Machine lookup failed");
}

export async function createCustomer(customerData) {
  const payload = {
    name: `${customerData.firstName || ""} ${customerData.lastName || ""}`.trim(),
    phone: customerData.phone || "",
    email: customerData.email || "",
    address: [
      customerData.addressLine1 || "",
      customerData.postalCode || "",
      customerData.city || "",
    ]
      .filter(Boolean)
      .join(", "),
    notes: customerData.notes || "",
  };

  const url = `${API_BASE_URL}/customers`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(res, "Create customer failed");
}

export async function listInstances() {
  const res = await fetch(`${API_BASE_URL}/instances`);

  return handleResponse(res, "Failed to load instances");
}

export async function createInstance(payload) {
  const res = await fetch(`${API_BASE_URL}/instances`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(res, "Failed to create instance");
}

export async function getInstanceHistory(instanceId) {
  const res = await fetch(
    `${API_BASE_URL}/instances/${encodeURIComponent(instanceId)}/history`
  );

  return handleResponse(res, "Failed to load instance history");
}

export async function createServiceRecord(payload) {
  const res = await fetch(`${API_BASE_URL}/service-records`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(res, "Failed to create service record");
}
export async function listCustomers() {
  const res = await fetch(`${API_BASE_URL}/customers`);
  return handleResponse(res, "Failed to load customers");
}