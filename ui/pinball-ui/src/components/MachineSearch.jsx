import { useState } from "react";
import { searchMachineByName } from "../api";

export default function MachineSearch() {
  const [machineName, setMachineName] = useState("");
  const [result, setResult] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [loading, setLoading] = useState(false);
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

      if (data?.mode === "result" && data?.machine) {
        setSelectedMachine(data.machine);
      }
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectMatch(match) {
    setSelectedMachine(match);
  }

  function renderSelectedMachine(machine) {
    if (!machine) return null;

    return (
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>Selected Machine</h3>
        <p>
          <strong>Name:</strong> {machine.name || "—"}
        </p>
        <p>
          <strong>Details:</strong> {machine.supplementary || "—"}
        </p>
        <p>
          <strong>Display:</strong> {machine.display || "—"}
        </p>
        <p>
          <strong>Machine ID:</strong> {machine.id || machine.machineId || "—"}
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
          {matches.map((match) => (
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

              <button type="button" onClick={() => handleSelectMatch(match)}>
                Select
              </button>
            </div>
          ))}
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
      return renderSelectedMachine(selectedMachine || result.machine);
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
