import CustomerForm from "../components/CustomerForm";

export default function Customers() {
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
      <h1 style={{ marginTop: 0, color: "#0f172a" }}>Customers</h1>
      <p style={{ color: "#64748b", marginTop: "-4px", marginBottom: "20px" }}>
        Create and manage customer records for workshop jobs and machine ownership.
      </p>
      <CustomerForm />
    </div>
  );
}