import { useEffect, useState } from "react";
import CustomerForm from "../components/CustomerForm";
import { listCustomers } from "../api";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCustomers() {
    try {
      setLoading(true);
      setError("");

      const data = await listCustomers();
      setCustomers(data.customers || []);
    } catch (err) {
      setError(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  return (
    <div>
      <h1>Customers</h1>
      <p>Create and manage customer records for workshop jobs and machine ownership.</p>

      <div style={{ marginBottom: "32px" }}>
        <CustomerForm onCreated={loadCustomers} />
      </div>

      <section
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Existing Customers</h2>

        {loading && <p>Loading customers...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && customers.length === 0 && (
          <p>No customers found.</p>
        )}

        {!loading && !error && customers.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Address</th>
                <th style={thStyle}>Customer ID</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.customerId}>
                  <td style={tdStyle}>{customer.name || "-"}</td>
                  <td style={tdStyle}>{customer.phone || "-"}</td>
                  <td style={tdStyle}>{customer.email || "-"}</td>
                  <td style={tdStyle}>{customer.address || "-"}</td>
                  <td style={tdStyle}>{customer.customerId || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "12px",
  borderBottom: "1px solid #ddd",
  background: "#f9fafb",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #eee",
};