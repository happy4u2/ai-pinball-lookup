import { useState } from "react";
import { searchMachineCandidates, getMachineById } from "../api";

function extractCandidates(data) {
  if (!data) return [];

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.suggestions)) return data.suggestions;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.matches)) return data.matches;
  if (Array.isArray(data.candidates)) return data.candidates;
  if (Array.isArray(data.items)) return data.items;

  if (data.result && Array.isArray(data.result)) return data.result;
  if (data.result && Array.isArray(data.result.suggestions)) return data.result.suggestions;
  if (data.result && Array.isArray(data.result.results)) return data.result.results;
  if (data.result && Array.isArray(data.result.matches)) return data.result.matches;
  if (data.result && Array.isArray(data.result.candidates)) return data.result.candidates;
  if (data.result && Array.isArray(data.result.items)) return data.result.items;

  return [];
}

function normalizeMachineFromResponse(data) {
  if (!data) return null;

  if (data.machine) return data.machine;

  if (data.result && typeof data.result === "object" && !Array.isArray(data.result)) {
    return {
      ...(data.selectedMatch || {}),
      ...data.result,
    };
  }

  return data;
}

function getMachineId(machine) {
  if (!machine) return "";

  if (machine.machineId) return machine.machineId;
  if (machine.id) return machine.id.startsWith("opdb:") ? machine.id : `opdb:${machine.id}`;
  if (machine.opdb_id) return `opdb:${machine.opdb_id}`;
  if (machine.opdbId) return `opdb:${machine.opdbId}`;

  return "";
}

function getMachineLabel(machine) {
  return (
    machine?.name ||
    machine?.title ||
    machine?.text ||
    "Unnamed machine"
  );
}

function getMachineSubtitle(machine) {
  if (machine?.supplementary) return machine.supplementary;

  return [
    machine?.manufacturer,
    machine?.year,
    machine?.type,
  ]
    .filter(Boolean)
    .join(" • ");
}

export default function MachineSearch({ onMachineSelected }) {
  const [machineName, setMachineName] = useState("");
  const [mode, setMode] = useState("idle");
  const [candidates, setCandidates] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectingId, setSelectingId] = useState("");
  const [error, setError] = useState("");

  async function loadMachineById(machineId) {
    const data = await getMachineById(machineId);
    const machine = normalizeMachineFromResponse(data);

    if (!machine) {
      throw new Error("Invalid machine response");
    }

    setSelectedMachine(machine);
    setMode("result");

    onMachineSelected?.(machine);
  }

  async function handleSearch(e) {
    e.preventDefault();

    const query = machineName.trim();
    if (!query) return;

    setLoading(true);
    setError("");
    setCandidates([]);
    setSelectedMachine(null);
    setMode("idle");

    onMachineSelected?.(null);

    try {
      const data = await searchMachineCandidates(query);
      const items = extractCandidates(data);

      if (!items.length) {
        setError("No matching machines found.");
        return;
      }

      if (items.length === 1) {
        const id = getMachineId(items[0]);
        if (!id) {
          setError("No ID returned.");
          return;
        }

        setSelectingId(id);
        await loadMachineById(id);
        return;
      }

      setCandidates(items);
      setMode("disambiguation");
    } catch (err) {
      setError(err?.message || "Search failed.");
    } finally {
      setLoading(false);
      setSelectingId("");
    }
  }

  function handleReset() {
    setMachineName("");
    setMode("idle");
    setCandidates([]);
    setSelectedMachine(null);
    setError("");
    setSelectingId("");

    onMachineSelected?.(null);
  }

  async function handleSelect(candidate) {
    const id = getMachineId(candidate);
    if (!id) return;

    setSelectingId(id);
    await loadMachineById(id);
    setSelectingId("");
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={machineName}
          onChange={(e) => setMachineName(e.target.value)}
          placeholder="Search machine..."
          className="flex-1 border px-3 py-2 rounded"
        />

        <button className="border px-4 py-2 rounded">
          {loading ? "Searching..." : "Search"}
        </button>

        <button type="button" onClick={handleReset} className="border px-4 py-2 rounded">
          Reset
        </button>
      </form>

      {error && <div className="text-red-600">{error}</div>}

      {mode === "disambiguation" &&
        candidates.map((c, i) => (
          <button
            key={i}
            onClick={() => handleSelect(c)}
            className="block w-full text-left border p-3 rounded"
          >
            <div>{getMachineLabel(c)}</div>
            <div className="text-sm text-gray-500">
              {getMachineSubtitle(c)}
            </div>
          </button>
        ))}

      {mode === "result" && selectedMachine && (
        <div className="border p-4 rounded">
          <strong>{getMachineLabel(selectedMachine)}</strong>
          <div>ID: {getMachineId(selectedMachine)}</div>
        </div>
      )}
    </div>
  );
}