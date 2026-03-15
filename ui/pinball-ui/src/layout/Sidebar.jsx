const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "machines", label: "Machines", icon: "◫" },
  { id: "customers", label: "Customers", icon: "◯" },
  { id: "instances", label: "Instances", icon: "▣" },
  { id: "service", label: "Service", icon: "▤" },
];

export default function Sidebar({ page, setPage }) {
  return (
    <aside
      style={{
        width: "260px",
        background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
        color: "white",
        padding: "24px 18px",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ marginBottom: "28px" }}>
        <div
          style={{
            fontSize: "12px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            opacity: 0.7,
            marginBottom: "8px",
          }}
        >
          Workshop System
        </div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          SwissPinball
        </div>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px",
          padding: "14px",
          marginBottom: "22px",
        }}
      >
        <div style={{ fontSize: "13px", opacity: 0.7, marginBottom: "6px" }}>
          Status
        </div>
        <div style={{ fontSize: "16px", fontWeight: 600 }}>Frontend MVP</div>
        <div style={{ fontSize: "13px", opacity: 0.75, marginTop: "6px" }}>
          Machine lookup + customer intake now live
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {navItems.map((item) => {
          const active = page === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                width: "100%",
                padding: "12px 14px",
                borderRadius: "12px",
                border: active
                  ? "1px solid rgba(96,165,250,0.55)"
                  : "1px solid transparent",
                background: active
                  ? "linear-gradient(180deg, rgba(59,130,246,0.22) 0%, rgba(37,99,235,0.18) 100%)"
                  : "transparent",
                color: "white",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "15px",
                fontWeight: active ? 600 : 500,
              }}
            >
              <span style={{ width: "18px", opacity: active ? 1 : 0.7 }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", paddingTop: "20px" }}>
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "14px",
            padding: "14px",
          }}
        >
          <div style={{ fontSize: "13px", opacity: 0.7 }}>Next phase</div>
          <div style={{ fontSize: "14px", marginTop: "6px", lineHeight: 1.4 }}>
            Customer → Instance → Service workflow
          </div>
        </div>
      </div>
    </aside>
  );
}