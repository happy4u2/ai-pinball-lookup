export async function opdbService(machineName) {
  if (!machineName) {
    throw new Error("Missing machineName");
  }

  const url = `https://opdb.org/api/search/typeahead?q=${encodeURIComponent(machineName)}`;

  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OPDB typeahead request failed: ${response.status} ${response.statusText} - ${text}`);
  }

  const data = await response.json();

  return data.map((item) => ({
    id: item.id,
    text: item.text,
    name: item.name,
    supplementary: item.supplementary,
    display: item.display
  }));
}