const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function listInstances() {
  const response = await fetch(`${API_BASE_URL}/instances`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Failed to load instances");
  }

  return data;
}

export async function createInstance(payload) {
  const response = await fetch(`${API_BASE_URL}/instances`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error || data?.message || "Failed to create instance",
    );
  }

  return data;
}

export async function getInstanceHistory(instanceId) {
  const response = await fetch(
    `${API_BASE_URL}/instances/${encodeURIComponent(instanceId)}/history`,
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error || data?.message || "Failed to load instance history",
    );
  }

  return data;
}
