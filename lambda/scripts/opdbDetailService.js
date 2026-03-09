export async function opdbDetailService(machineId) {
  const apiToken = process.env.OPDB_API_TOKEN;

  if (!apiToken) {
    throw new Error("Missing OPDB_API_TOKEN environment variable");
  }

  if (!machineId) {
    throw new Error("Missing machineId");
  }

  const url = `https://opdb.org/api/machines/${encodeURIComponent(machineId)}?api_token=${encodeURIComponent(apiToken)}`;

  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OPDB detail request failed: ${response.status} ${response.statusText} - ${text}`);
  }

  return await response.json();
}