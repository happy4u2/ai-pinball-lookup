function normalizeMachineName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export async function opdbService(machineName) {
  if (!machineName) {
    throw new Error("Missing machineName");
  }

  const query = String(machineName).trim();
  const queryNorm = normalizeMachineName(query);

  const url = `https://opdb.org/api/search/typeahead?q=${encodeURIComponent(query)}`;

  console.log("OPDB TYPEAHEAD QUERY:", query);
  console.log("OPDB TYPEAHEAD URL:", url);

  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `OPDB typeahead request failed: ${response.status} ${response.statusText} - ${text}`,
    );
  }

  const data = await response.json();

  const mapped = Array.isArray(data)
    ? data.map((item) => ({
        id: item.id || "",
        text: item.text || "",
        name: item.name || "",
        supplementary: item.supplementary || "",
        display: item.display || "",
      }))
    : [];

  console.log("OPDB RAW RESULT COUNT:", mapped.length);
  console.log("OPDB RAW RESULTS:", mapped);

  const exactMatches = mapped.filter((item) => {
    const combined = normalizeMachineName(
      `${item.name} ${item.text} ${item.display} ${item.supplementary}`,
    );
    return combined.includes(queryNorm);
  });

  if (exactMatches.length > 0) {
    console.log("OPDB FILTERED MATCHES:", exactMatches);
    return exactMatches;
  }

  return mapped;
}
