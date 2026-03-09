function normalizeTitle(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\bthe\b/g, "")
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
    "redux"
  ];

  for (const word of variantWords) {
    const re = new RegExp(`\\b${word}\\b`, "i");
    if (re.test(item.name || "") || re.test(item.text || "")) {
      score -= 50;
    }
  }

  const year = extractYear(item.supplementary);
  if (year) {
    score += (2100 - year) / 10;
  }

  return score;
}

export function selectBestMatch(query, results) {
  if (!results?.length) {
    return null;
  }

  const scored = results.map((item, index) => ({
    item,
    index,
    score: scoreResult(query, item)
  }));

  console.log("Scored matches:", JSON.stringify(scored, null, 2));

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.index - b.index;
  });

  return scored[0].item;
}