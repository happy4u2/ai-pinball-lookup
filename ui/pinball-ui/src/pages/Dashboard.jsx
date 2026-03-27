import { useEffect, useMemo, useState } from "react";
import { listCustomers, listInstances } from "../api";

function StatCard({ title, value, subtext }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "18px",
        padding: "20px",
        boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
        border: "1px solid rgba(15,23,42,0.05)",
      }}
    >
      <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "10px" }}>{title}</div>
      <div
        style={{
          fontSize: "30px",
          fontWeight: 700,
          color: "#0f172a",
          lineHeight: 1,
          marginBottom: "8px",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "13px", color: "#94a3b8" }}>{subtext}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "18px",
        padding: "22px",
        boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
        border: "1px solid rgba(15,23,42,0.05)",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: "16px", fontSize: "18px", color: "#0f172a" }}>{title}</h3>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState([]);
  const [instances, setInstances] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [customerData, instanceData] = await Promise.all([
          listCustomers(),
          listInstances(),
        ]);

        setCustomers(customerData.customers || []);
        setInstances(instanceData.items || instanceData.instances || []);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const statusCounts = useMemo(() => {
    return instances.reduce((acc, item) => {
      const key = item.status || "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [instances]);

  const locationCounts = useMemo(() => {
    return instances.reduce((acc, item) => {
      const key = item.currentLocationType || "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [instances]);

  const recentInstances = useMemo(() => {
    return [...instances]
      .sort((a, b) => String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || "")))
      .slice(0, 5);
  }, [instances]);

  return (
    <div>
      <div style={{ marginBottom: "26px" }}>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#64748b",
            marginBottom: "8px",
          }}
        >
          SwissPinball Control Panel
        </div>

        <h1 style={{ margin: 0, fontSize: "34px", color: "#0f172a", lineHeight: 1.1 }}>
          Workshop Dashboard
        </h1>

        <p style={{ marginTop: "10px", marginBottom: 0, color: "#475569", fontSize: "16px" }}>
          Manage customers, machine records, workshop flow, and service history.
        </p>
      </div>

      {error && <div style={{ color: "#b91c1c", marginBottom: "16px" }}>{error}</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px",
          marginBottom: "24px",
        }}
      >
        <StatCard title="Customers" value={loading ? "…" : customers.length} subtext="Live count from backend" />
        <StatCard title="Instances" value={loading ? "…" : instances.length} subtext="Physical machines tracked" />
        <StatCard title="In service" value={loading ? "…" : statusCounts.in_service || 0} subtext="Machines currently in service" />
        <StatCard title="Workshop" value={loading ? "…" : locationCounts.workshop || 0} subtext="Machines at SwissPinball" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "18px" }}>
        <Panel title="Recent machine activity">
          {loading ? (
            <div>Loading...</div>
          ) : recentInstances.length === 0 ? (
            <div style={{ color: "#64748b" }}>No machine instances yet.</div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {recentInstances.map((item) => (
                <div key={item.instanceId} style={{ padding: "14px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#f8fafc" }}>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>{item.machineName || "Unknown machine"}</div>
                  <div style={{ color: "#475569", marginTop: "4px" }}>{item.instanceName || "No instance name"}</div>
                  <div style={{ fontSize: "13px", color: "#64748b", marginTop: "6px" }}>
                    {item.status || "unknown"} · {item.currentLocationLabel || item.currentLocationType || "no location"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Workshop snapshot">
          <div style={{ color: "#334155", lineHeight: 1.8 }}>
            <div>• Active: <strong>{loading ? "…" : statusCounts.active || 0}</strong></div>
            <div>• Awaiting parts: <strong>{loading ? "…" : statusCounts.awaiting_parts || 0}</strong></div>
            <div>• Ready: <strong>{loading ? "…" : statusCounts.ready || 0}</strong></div>
            <div>• Stored: <strong>{loading ? "…" : statusCounts.stored || 0}</strong></div>
            <div>• On rent: <strong>{loading ? "…" : locationCounts.on_rent || 0}</strong></div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
