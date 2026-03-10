function decodeHtmlEntities(text) {
  return text
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripTags(text) {
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function classifyManualType(text, url) {
  const combined = `${text} ${url}`.toLowerCase();

  if (combined.includes("schematic")) return "schematic";
  if (combined.includes("flyer")) return "flyer";
  if (combined.includes("instruction")) return "instruction";
  if (combined.includes("catalog")) return "catalog";
  if (combined.includes("service")) return "service";
  if (combined.includes("manual")) return "manual";
  if (combined.includes(".pdf")) return "document";

  return "document";
}

function looksLikeManualLink(text, url) {
  const combined = `${text} ${url}`.toLowerCase();

  return (
    combined.includes("manual") ||
    combined.includes("schematic") ||
    combined.includes("instruction") ||
    combined.includes("flyer") ||
    combined.includes("catalog") ||
    combined.includes("service") ||
    combined.includes(".pdf") ||
    combined.includes("/files/")
  );
}

function extractLinksFromHtml(html, baseUrl) {
  const links = [];
  const anchorRegex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match;
  while ((match = anchorRegex.exec(html)) !== null) {
    const rawHref = match[1];
    const rawText = match[2];

    try {
      const absoluteUrl = new URL(rawHref, baseUrl).toString();
      const text = decodeHtmlEntities(stripTags(rawText));

      links.push({
        url: absoluteUrl,
        title: text || absoluteUrl,
      });
    } catch {
      // ignore malformed URLs
    }
  }

  return links;
}

function normalizeManuals(links) {
  const seen = new Set();
  const manuals = [];

  for (const link of links) {
    if (!looksLikeManualLink(link.title, link.url)) {
      continue;
    }

    if (seen.has(link.url)) {
      continue;
    }

    seen.add(link.url);

    manuals.push({
      source: "ipdb",
      title: link.title || "IPDB Document",
      url: link.url,
      type: classifyManualType(link.title, link.url),
    });
  }

  return manuals;
}

export async function discoverIpdbManuals(ipdbId) {
  if (!ipdbId) {
    return {
      manuals: [],
      ipdbMachineUrl: null,
      manualsFetchStatus: "no_ipdb_id",
      manualsFetchedAt: new Date().toISOString(),
    };
  }

  const ipdbMachineUrl = `https://www.ipdb.org/machine.cgi?id=${ipdbId}`;

  try {
    const response = await fetch(ipdbMachineUrl, {
      method: "GET",
      headers: {
        "User-Agent": "SwissPinball Lookup/1.0",
      },
    });

    if (!response.ok) {
      return {
        manuals: [],
        ipdbMachineUrl,
        manualsFetchStatus: `http_${response.status}`,
        manualsFetchedAt: new Date().toISOString(),
      };
    }

    const html = await response.text();
    const links = extractLinksFromHtml(html, ipdbMachineUrl);
    const manuals = normalizeManuals(links);

    return {
      manuals,
      ipdbMachineUrl,
      manualsFetchStatus: manuals.length ? "success" : "no_manuals_found",
      manualsFetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      manuals: [],
      ipdbMachineUrl,
      manualsFetchStatus: "fetch_error",
      manualsFetchedAt: new Date().toISOString(),
      error: error.message,
    };
  }
}
