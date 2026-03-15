import MachineSearch from "../components/MachineSearch";

export default function Machines() {
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
      <MachineSearch />
    </div>
  );
}