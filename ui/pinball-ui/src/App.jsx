import { useEffect, useRef, useState } from "react";

const API_BASE =
  "https://cp114tpb2i.execute-api.eu-central-1.amazonaws.com/prod";

export default function App() {
  const [query, setQuery] = useState("");
  const [apiResponse, setApiResponse] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleInputChange(e) {
    const value = e.target.value;
    setQuery(value);
    setError("");
    setShowSuggestions(true);
    setHighlightedIndex(-1);

    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);

    try {
      const res = await fetch(
        `${API_BASE}/machine?q=${encodeURIComponent(value)}`,
      );

      if (!res.ok) {
        throw new Error(`Typeahead failed: ${res.status}`);
      }

      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error(err);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();

    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setSuggestions([]);
    setShowSuggestions(false);
    setHighlightedIndex(-1);

    try {
      const res = await fetch(
        `${API_BASE}/machine?name=${encodeURIComponent(query)}`,
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
      }

      setApiResponse(data);
    } catch (err) {
      console.error(err);
      setApiResponse(null);
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSuggestionClick(item) {
    setQuery(item.name);
    setSuggestions([]);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${API_BASE}/machine?id=${encodeURIComponent(item.id)}`,
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
      }

      setApiResponse(data);
    } catch (err) {
      console.error(err);
      setApiResponse(null);
      setError(err.message || "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    const hasSuggestions =
      showSuggestions && !loadingSuggestions && suggestions.length > 0;

    if (e.key === "ArrowDown") {
      if (!hasSuggestions) return;
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0,
      );
      return;
    }

    if (e.key === "ArrowUp") {
      if (!hasSuggestions) return;
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1,
      );
      return;
    }

    if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      return;
    }

    if (e.key === "Enter") {
      if (hasSuggestions && highlightedIndex >= 0) {
        e.preventDefault();
        handleSuggestionClick(suggestions[highlightedIndex]);
      }
    }
  }

  function renderSuggestions() {
    if (!showSuggestions || query.trim().length < 2) return null;
    if (!loadingSuggestions && suggestions.length === 0) return null;

    return (
      <div className="absolute z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg">
        {loadingSuggestions ? (
          <div className="px-4 py-3 text-sm text-gray-500">Searching…</div>
        ) : (
          <ul className="max-h-80 overflow-y-auto py-1">
            {suggestions.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(item)}
                  className={`block w-full px-4 py-3 text-left ${
                    highlightedIndex === index
                      ? "bg-gray-100"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">
                    {item.supplementary || "Unknown"}
                    {item.display ? ` · ${item.display}` : ""}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  const isDisambiguation = apiResponse?.mode === "disambiguation";
  const disambiguationMatches = apiResponse?.matches || [];

  function renderDisambiguation() {
    if (!isDisambiguation || disambiguationMatches.length === 0) return null;

    return (
      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-amber-900">
          Multiple matches found
        </h2>
        <p className="mb-4 text-sm text-amber-800">
          Select the exact machine you want.
        </p>

        <ul className="space-y-2">
          {disambiguationMatches.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleSuggestionClick(item)}
                className="block w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-left hover:bg-amber-100"
              >
                <div className="font-medium text-gray-900">{item.name}</div>
                <div className="text-sm text-gray-500">
                  {item.supplementary || "Unknown"}
                  {item.display ? ` · ${item.display}` : ""}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const selectedMatch = apiResponse?.selectedMatch;
  const result = apiResponse?.result;
  const cache = apiResponse?.cache;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          AI Pinball Lookup
        </h1>
        <p className="mb-6 text-gray-600">
          Try a search like Twilight Zone, Addams Family, Jurassic Park, or
          Medieval Madness.
        </p>

        <form onSubmit={handleSearch} className="mb-8">
          <label
            htmlFor="machine-search"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            GET /machine?name=
          </label>

          <div ref={wrapperRef} className="relative">
            <div className="flex gap-2">
              <input
                id="machine-search"
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (query.trim().length >= 2) {
                    setShowSuggestions(true);
                  }
                }}
                placeholder="Search for a pinball machine..."
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none ring-0 focus:border-gray-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-black px-5 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Search"}
              </button>
            </div>

            {renderSuggestions()}
          </div>
        </form>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {renderDisambiguation()}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Selected match
            </h2>

            {selectedMatch ? (
              <>
                <div className="text-xl font-semibold text-gray-900">
                  {selectedMatch.name}
                </div>
                <div className="mt-1 text-gray-600">
                  {selectedMatch.supplementary || "Unknown"}
                  {selectedMatch.display ? ` · ${selectedMatch.display}` : ""}
                </div>

                <div className="mt-6">
                  <div className="mb-1 text-sm font-medium text-gray-700">
                    Cache status
                  </div>
                  <div className="text-gray-900">
                    {cache?.hit ? "Hit" : "Miss"}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {cache?.cachedAt || "No cache timestamp"}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-gray-500">—</div>
                <div className="mt-1 text-sm text-gray-500">No result yet</div>

                <div className="mt-6">
                  <div className="mb-1 text-sm font-medium text-gray-700">
                    Cache status
                  </div>
                  <div className="text-gray-500">—</div>
                  <div className="mt-2 text-sm text-gray-500">
                    No cache timestamp
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Machine
            </h2>

            {result ? (
              <>
                {result.primary_image ? (
                  <img
                    src={result.primary_image}
                    alt={result.name}
                    className="mb-4 h-64 w-full rounded-xl object-contain bg-gray-100"
                  />
                ) : (
                  <div className="mb-4 flex h-64 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                    No image
                  </div>
                )}

                <div className="text-2xl font-bold text-gray-900">
                  {result.name || "Unknown machine"}
                </div>
                <div className="mt-1 text-gray-600">
                  {result.manufacturer || "Unknown manufacturer"}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="text-gray-500">Technical</div>
                    <div className="mt-1 font-medium text-gray-900">
                      {result.display || "—"}
                    </div>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="text-gray-500">Player count</div>
                    <div className="mt-1 font-medium text-gray-900">
                      {result.player_count || "unknown"}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-gray-500">—</div>
                <div className="mt-1 text-gray-600">Unknown manufacturer</div>

                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="text-gray-500">Technical</div>
                    <div className="mt-1 font-medium text-gray-900">—</div>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="text-gray-500">Player count</div>
                    <div className="mt-1 font-medium text-gray-900">
                      unknown
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Normalized response
          </h2>
          <div className="mb-3 text-sm text-gray-500">application/json</div>
          <pre className="overflow-x-auto rounded-xl bg-gray-950 p-4 text-sm text-green-200">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
