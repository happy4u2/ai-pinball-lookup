import { useState } from "react"

export default function MachineSearch() {
  const [query, setQuery] = useState("")
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(false)

  async function searchMachines(q) {
    if (!q || q.length < 2) {
      setMachines([])
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/machine/search?q=${q}`)
      const data = await res.json()

      // 🔥 DEDUPE (VERY IMPORTANT)
      const unique = []
      const seen = new Set()

      for (const m of data) {
        if (!seen.has(m.machineName)) {
          seen.add(m.machineName)
          unique.push(m)
        }
      }

      setMachines(unique)
    } catch (err) {
      console.error("Search failed", err)
    }

    setLoading(false)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Machine Search</h1>
      <p className="text-gray-500 mb-4">
        Search for pinball machines to add to your collection
      </p>

      <input
        className="w-full border rounded p-2 mb-4"
        placeholder="Search machines..."
        value={query}
        onChange={(e) => {
          const val = e.target.value
          setQuery(val)
          searchMachines(val)
        }}
      />

      {loading && <div className="text-gray-500">Searching...</div>}

      {!loading && machines.length > 0 && (
        <div className="text-sm text-gray-500 mb-2">
          {machines.length} machines found
        </div>
      )}

      <div className="space-y-3">
        {machines.map((m, i) => (
          <div
            key={i}
            className="border rounded p-4 flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">{m.machineName}</div>
              <div className="text-sm text-gray-500">
                {m.manufacturer} {m.year ? `· ${m.year}` : ""}
              </div>
            </div>

            <button
              className="px-3 py-1 bg-blue-600 text-white rounded"
              onClick={() => console.log("Add instance:", m)}
            >
              Add Instance
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}