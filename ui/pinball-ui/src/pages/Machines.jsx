import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MachineSearch from "../components/MachineSearch";

function buildMachinePrefill(machine) {
  const rawId = machine?.machineId || machine?.opdb_id || machine?.opdbId || machine?.id || "";
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
  const navigate = useNavigate();

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
    <div
      style={{
        background: "white",
        borderRadius: "18px",
        padding: "24px",
        boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
        border: "1px solid rgba(15,23,42,0.05)",
        maxWidth: "900px",
      }}
    >
      <h1 style={{ marginTop: 0, color: "#0f172a" }}>Machine Lookup</h1>
      <p style={{ color: "#64748b", marginTop: "-4px", marginBottom: "20px" }}>
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
          <h2 style={{ marginTop: 0 }}>Selected Machine Action</h2>

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
  );
}