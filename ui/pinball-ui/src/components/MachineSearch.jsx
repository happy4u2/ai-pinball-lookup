import { useState } from "react";
import { getMachineById, searchMachineByName } from "../api";

function normalizeMachineFromResponse(data) {
  return data?.result || data?.machine || null;
}

function getMachineId(machine) {
  if (!machine) return "";

  if (machine.machineId) return machine.machineId;
  if (machine.id?.startsWith("opdb:")) return machine.id;
  if (machine.opdb_id) return `opdb:${machine.opdb_id}`;
  if (machine.id) return machine.id;

  return "";
}

export default function MachineSearch({ onMachineSelected }) {
  const [machineName, setMachineName] = useState("");
  const [result, setResult] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectingId, setSelectingId] = useState("");
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setSelectedMachine(null);

    try {
      const data = await searchMachineByName(machineName);
      setResult(data);

      const machine = normalizeMachineFromResponse(data);
      if (data?.mode === "result" && machine) {
        setSelectedMachine(machine);

        if (onMachineSelected) {
          onMachineSelected(machine);
        }
      }
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectMatch(match) {
    const matchId = match?.id;

    if (!matchId) {
      setError("Selected match is missing an ID.");
      return;
    }

    setSelectingId(matchId);
    setError("");

    try {
      const data = await getMachineById(matchId);
      const machine = normalizeMachineFromResponse(data);

      if (!machine) {
        throw new Error("Machine details were not returned by the API");
      }

      setResult(data);
      setSelectedMachine(machine);

      if (onMachineSelected) {
        onMachineSelected(machine);
      }
    } catch (err) {
      setError(err.message || "Failed to load selected machine");
    } finally {
      setSelectingId("");
    }
  }

  function renderSelectedMachine(machine) {
    if (!machine) return null;

    return (
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>Selected Machine</h3>
        <p>
          <strong>Name:</strong> {machine.name || machine.common_name || "—"}
        </p>
        <p>
          <strong>Manufacturer:</strong> {machine.manufacturer || "—"}
        </p>
        <p>
          <strong>Display:</strong> {machine.display || "—"}
        </p>
        <p>
          <strong>Players:</strong> {machine.player_count || "—"}
        </p>
        <p>
          <strong>Type:</strong> {machine.type || "—"}
        </p>
        <p>
          <strong>Machine ID:</strong> {getMachineId(machine) || "—"}
        </p>
      </div>
    );
  }

  function renderDisambiguation(matches) {
    if (!Array.isArray(matches) || matches.length === 0) return null;

    return (
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>Multiple Matches Found</h3>
        <p>Please choose the correct machine.</p>

        <div style={{ display: "grid", gap: "12px" }}>
          {matches.map((match) => {
            const isLoadingThis = selectingId === match.id;

            return (
              <div key={match.id} style={candidateStyle}>
                <div>
                  <div>
                    <strong>
                      {match.name || match.text || "Unknown machine"}
                    </strong>
                  </div>
                  <div>{match.supplementary || "—"}</div>
                  <div style={{ fontSize: "0.9rem", color: "#666" }}>
                    Display: {match.display || "—"}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#666" }}>
                    Score: {match.score ?? "—"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectMatch(match)}
                  disabled={!!selectingId}
                >
                  {isLoadingThis ? "Loading..." : "Select"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderResult() {
    if (!result) return null;

    if (result.mode === "disambiguation") {
      return (
        <>
          {renderDisambiguation(result.matches)}
          {renderSelectedMachine(selectedMachine)}
        </>
      );
    }

    if (result.mode === "result") {
      return renderSelectedMachine(selectedMachine || normalizeMachineFromResponse(result));
    }

    if (result.mode === "not_found") {
      return (
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>No Match Found</h3>
          <p>No machine matched your search. Try a more specific name.</p>
        </div>
      );
    }

    return (
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>Search Response</h3>
        <pre
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <section
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Machine Lookup</h2>
      <p>
        Search OPDB and choose the correct machine if multiple matches are
        found.
      </p>

      <form
        onSubmit={handleSearch}
        style={{ display: "flex", gap: "0.5rem", marginBottom: "16px" }}
      >
        <input
          type="text"
          value={machineName}
          onChange={(e) => setMachineName(e.target.value)}
          placeholder="Enter machine name"
          style={{ padding: "0.5rem", minWidth: "300px" }}
        />
        <button type="submit" disabled={loading || !machineName.trim()}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {renderResult()}
    </section>
  );
}

const cardStyle = {
  marginTop: "16px",
  padding: "16px",
  background: "#f9fafb",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
};

const candidateStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  padding: "12px",
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
};
