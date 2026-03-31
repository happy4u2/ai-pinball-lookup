import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MachineSearch from "../components/MachineSearch";
import { listInstances } from "../api";

const panelStyle = {
  background: "white",
  borderRadius: "18px",
  padding: "24px",
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
  border: "1px solid rgba(15,23,42,0.05)",
};

function formatEnumLabel(value = "") {
  if (!value) return "—";

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildMachinePrefill(machine) {
  const rawId =
    machine?.machineId ||
    machine?.opdb_id ||
    machine?.opdbId ||
    machine?.id ||
    "";

  const normalizedMachineId = String(rawId).startsWith("opdb:")
    ? String(rawId)
    : rawId
      ? `opdb:${rawId}`
      : "";

  return {
    machineId: normalizedMachineId,
    machineName:
      machine?.name ||
      machine?.machineName ||
      machine?.common_name ||
      machine?.title ||
      "",
  };
}

export default function Machines() {
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [existingInstances, setExistingInstances] = useState([]);
  const [instancesLoading, setInstancesLoading] = useState(true);
  const [instancesError, setInstancesError] = useState("");
  const navigate = useNavigate();

useEffect(() => {
  async function loadExistingInstances() {
    try {
      setInstancesLoading(true);
      setInstancesError("");

      const data = await listInstances();
      setExistingInstances(
        Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [],
      );
    } catch (err) {
      setInstancesError(err.message || "Failed to load existing instances");
    } finally {
      setInstancesLoading(false);
    }
  }

  loadExistingInstances();
}, []);

  function handleMachineSelected(machine) {
    setSelectedMachine(machine);
  }

  function handleCreateInstance() {
    if (!selectedMachine) return;

    navigate("/instances/new", {
      state: buildMachinePrefill(selectedMachine),
    });
  }

  return (
    <div style={{ display: "grid", gap: "24px", maxWidth: "900px" }}>
      <div style={panelStyle}>
        <h1 style={{ marginTop: 0, color: "#0f172a" }}>Machine Lookup</h1>
        <p
          style={{ color: "#64748b", marginTop: "-4px", marginBottom: "20px" }}
        >
          Search live machine data from the SwissPinball backend.
        </p>

        <MachineSearch onMachineSelected={handleMachineSelected} />

        {selectedMachine && (
          <div
            style={{
              marginTop: "24px",
              padding: "20px",
              borderRadius: "12px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <h2 style={{ marginTop: 0, color: "#0f172a" }}>
              Selected Machine Action
            </h2>

            <p>
              <strong>Name:</strong>{" "}
              {selectedMachine.name ||
                selectedMachine.machineName ||
                selectedMachine.common_name ||
                "—"}
            </p>

            <p>
              <strong>Manufacturer:</strong>{" "}
              {selectedMachine.manufacturer || "—"}
            </p>

            <p>
              <strong>Machine ID:</strong>{" "}
              {buildMachinePrefill(selectedMachine).machineId || "—"}
            </p>

            <button type="button" onClick={handleCreateInstance}>
              Create Instance from this Machine
            </button>
          </div>
        )}
      </div>

      <div style={panelStyle}>
        <h2 style={{ marginTop: 0, color: "#0f172a" }}>
          Machines Already in the System
        </h2>
        <p style={{ color: "#64748b", marginTop: 0 }}>
          Existing machine instances currently tracked in SwissPinball.
        </p>

        {instancesError && (
          <div style={{ color: "#b91c1c", marginBottom: "12px" }}>
            {instancesError}
          </div>
        )}

        {instancesLoading ? (
          <div>Loading existing instances...</div>
        ) : existingInstances.length === 0 ? (
          <div>No instances found yet.</div>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {existingInstances.map((item) => (
              <div
                key={item.instanceId}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "14px",
                  background: "#f8fafc",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>
                      {item.instanceName ||
                        item.machineName ||
                        "Unnamed instance"}
                    </div>
                    <div style={{ color: "#475569", marginTop: "4px" }}>
                      {item.machineName || "Unknown machine"}
                    </div>
                  </div>

                  <Link
                    to={`/instances/${item.instanceId}`}
                    style={{
                      color: "#2563eb",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    Open instance →
                  </Link>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "10px",
                    marginTop: "12px",
                    color: "#475569",
                    fontSize: "14px",
                  }}
                >
                  <div>
                    <strong>Status:</strong> {formatEnumLabel(item.status)}
                  </div>
                  <div>
                    <strong>Location:</strong>{" "}
                    {item.currentLocationLabel ||
                      formatEnumLabel(item.currentLocationType)}
                  </div>
                  <div>
                    <strong>Machine ID:</strong> {item.machineId || "—"}
                  </div>
                  <div>
                    <strong>Condition:</strong> {item.condition || "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
