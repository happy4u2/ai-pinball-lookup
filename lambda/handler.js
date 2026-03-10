function normalizeTitle(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\bthe\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function baseTitle(text) {
  return normalizeTitle(text)
    .replace(
      /\b(gold|limited|edition|special|premium|le|collector|anniversary|deluxe|remake|redux|pro|home edition|30th anniversary)\b/g,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
}

function extractYear(supplementary) {
  const match = supplementary?.match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

function scoreResult(query, item) {
  const normalizedQuery = normalizeTitle(query);
  const normalizedName = normalizeTitle(item.name);
  const normalizedText = normalizeTitle(item.text);

  let score = 0;

  if (normalizedName === normalizedQuery) {
    score += 100;
  }

  if (normalizedText.startsWith(normalizedQuery)) {
    score += 25;
  }

  if (normalizedName.includes(normalizedQuery)) {
    score += 20;
  }

  const variantWords = [
    "gold",
    "limited",
    "edition",
    "special",
    "premium",
    "le",
    "collector",
    "anniversary",
    "deluxe",
    "remake",
    "redux",
    "pro",
    "home edition",
    "30th anniversary"
  ];

  for (const word of variantWords) {
    const re = new RegExp(`\\b${word}\\b`, "i");

    const queryHasWord = re.test(query || "");
    const itemHasWord = re.test(item.name || "") || re.test(item.text || "");

    if (queryHasWord && itemHasWord) {
      score += 40;
    } else if (!queryHasWord && itemHasWord) {
      score -= 50;
    }
  }

  const year = extractYear(item.supplementary);
  if (year) {
    score += (2100 - year) / 10;
  }

  return score;
}

export function resolveMatch(query, results) {
  if (!results?.length) {
    return {
      mode: "not_found",
      matches: []
    };
  }

  const scored = results.map((item, index) => ({
    item,
    index,
    score: scoreResult(query, item)
  }));

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.index - b.index;
  });

  console.log("Scored matches:", JSON.stringify(scored, null, 2));

  const top = scored[0];
  const second = scored[1] || null;

  const shortlist = scored.slice(0, 5).map((entry) => ({
    id: entry.item.id,
    text: entry.item.text,
    name: entry.item.name,
    supplementary: entry.item.supplementary,
    display: entry.item.display,
    score: entry.score
  }));

  const queryBase = baseTitle(query);
  const sameFamily = scored.filter(
    (entry) => baseTitle(entry.item.name) === queryBase
  );

  const queryHasExplicitVariant =
    normalizeTitle(query) !== queryBase;

  if (!queryHasExplicitVariant && sameFamily.length >= 2) {
    return {
      mode: "disambiguation",
      matches: shortlist
    };
  }

  // NEW: catches fragment searches like "addams"
  const partialFamilyMatches = scored.filter((entry) => {
    const itemBase = baseTitle(entry.item.name);
    return itemBase.includes(queryBase);
  });

  if (!queryHasExplicitVariant && queryBase && partialFamilyMatches.length >= 2) {
    return {
      mode: "disambiguation",
      matches: shortlist
    };
  }

  const clearlyBetter =
    !second ||
    top.score - second.score >= 35;

  if (clearlyBetter) {
    return {
      mode: "selected",
      selectedMatch: top.item,
      matches: shortlist
    };
  }

  return {
    mode: "disambiguation",
    matches: shortlist
  };
}