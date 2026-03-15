const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function searchMachineByName(name) {
  const url = `${API_BASE_URL}/machine?name=${encodeURIComponent(name)}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Machine lookup failed: ${res.status}`);
  }

  return res.json();
}

export async function createCustomer(customerData) {
  const url = `${API_BASE_URL}/customers`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customerData),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Create customer failed: ${res.status} ${text}`);
  }

  return res.json();
}