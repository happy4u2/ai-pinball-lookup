export async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  return response.json();
}

export async function downloadFile(url, filePath) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const fs = await import("node:fs");
  fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
}