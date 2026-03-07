export async function opdbService(machineName) {
  if (!machineName || !machineName.trim()) {
    throw new Error("machineName is required");
  }

  const url = `https://opdb.org/api/search/typeahead?q=${encodeURIComponent(machineName)}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`OPDB request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}