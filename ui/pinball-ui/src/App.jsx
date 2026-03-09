import { useState } from "react";

const API_BASE =
  "https://cp114tpb2i.execute-api.eu-central-1.amazonaws.com/prod";

export default function App() {
  const [machineName, setMachineName] = useState("Addams Family");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  async function searchMachine(nameOverride) {
    const query = (nameOverride ?? machineName).trim();
    if (!query) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/machine?name=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  const result = data?.result;
  const selectedMatch = data?.selectedMatch;
  const cache = data?.cache;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm">
              AI Pinball Lookup
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Pinball machine search API
            </h1>
            <p className="mt-3 max-w-2xl text-base text-slate-600">
              Search pinball machines, view normalized results, and inspect
              cache-aware responses from your AWS serverless backend.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-slate-500">Phase</div>
              <div className="mt-1 text-lg font-semibold">8</div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-slate-500">Runtime</div>
              <div className="mt-1 text-lg font-semibold">Lambda</div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-slate-500">Cache</div>
              <div className="mt-1 text-lg font-semibold">DynamoDB</div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Machine lookup</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Try a search like Twilight Zone, Addams Family, or Medieval
                  Madness.
                </p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                GET /machine?name=
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={machineName}
                onChange={(e) => setMachineName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") searchMachine();
                }}
                className="h-12 flex-1 rounded-2xl border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-slate-400"
                placeholder="Enter machine name"
              />
              <button
                onClick={() => searchMachine()}
                disabled={loading}
                className="h-12 rounded-2xl bg-slate-900 px-5 font-medium text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Searching..." : "Search API"}
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Selected match</div>
                <div className="mt-2 text-lg font-semibold">
                  {selectedMatch?.name || selectedMatch?.text || "—"}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {selectedMatch?.supplementary || "No result yet"}
                  {selectedMatch?.display ? ` · ${selectedMatch.display}` : ""}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Cache status</div>
                <div className="mt-2 text-lg font-semibold">
                  {cache ? (cache.hit ? "Hit" : "Miss") : "—"}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {cache?.cachedAt || "No cache timestamp"}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Machine</div>
                <div className="mt-2 text-lg font-semibold">
                  {result?.name || "—"}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {result?.manufacturer || "Unknown manufacturer"}
                  {result?.manufacture_date
                    ? ` · ${result.manufacture_date}`
                    : ""}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Technical</div>
                <div className="mt-2 text-lg font-semibold">
                  {result?.display || "—"}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {result?.player_count
                    ? `${result.player_count} players`
                    : "Player count unknown"}
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-slate-100 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 text-sm text-slate-400">
                <span>Normalized response</span>
                <span>application/json</span>
              </div>
              <pre className="overflow-x-auto p-4 text-xs leading-6">
                {JSON.stringify(data, null, 2) || "No response yet"}
              </pre>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold">Quick tests</h3>
              <div className="mt-4 space-y-3 text-sm">
                {[
                  "Corvette",
                  "Twilight Zone",
                  "Medieval Madness",
                  "Addams Family",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setMachineName(item);
                      searchMachine(item);
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-lg font-semibold">System flow</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                {[
                  "API Gateway receives request",
                  "Lambda parses machine name",
                  "DynamoDB cache is checked",
                  "OPDB searched if cache miss",
                  "Best match selected and normalized",
                  "Response returned as JSON",
                ].map((step) => (
                  <div
                    key={step}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}