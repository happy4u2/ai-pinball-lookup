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
      <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "10px" }}>
        {title}
      </div>
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
      <h3
        style={{
          marginTop: 0,
          marginBottom: "16px",
          fontSize: "18px",
          color: "#0f172a",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function Dashboard() {
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

        <h1
          style={{
            margin: 0,
            fontSize: "34px",
            color: "#0f172a",
            lineHeight: 1.1,
          }}
        >
          Workshop Dashboard
        </h1>

        <p
          style={{
            marginTop: "10px",
            marginBottom: 0,
            color: "#475569",
            fontSize: "16px",
          }}
        >
          Manage customers, machine records, workshop flow, and service history.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px",
          marginBottom: "24px",
        }}
      >
        <StatCard title="Customers" value="1" subtext="Customer intake connected" />
        <StatCard title="Machines" value="Live" subtext="Lookup endpoint working" />
        <StatCard title="Workshop Flow" value="MVP" subtext="UI shell restored" />
        <StatCard title="Backend" value="Online" subtext="AWS API reachable" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: "18px",
        }}
      >
        <Panel title="Today’s focus">
          <div style={{ color: "#334155", lineHeight: 1.7 }}>
            <div>• Restore the proper SwissPinball dashboard experience</div>
            <div>• Create customer → machine instance workflow</div>
            <div>• Improve forms and result cards</div>
            <div>• Add workshop / storage / on-rent machine statuses</div>
          </div>
        </Panel>

        <Panel title="Latest win">
          <div style={{ color: "#334155", lineHeight: 1.7 }}>
            Customer creation is now working from the browser, which means the
            UI is talking properly to your AWS backend again.
          </div>
        </Panel>
      </div>
    </div>
  );
}