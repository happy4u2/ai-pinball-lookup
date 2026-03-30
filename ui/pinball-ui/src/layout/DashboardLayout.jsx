import Sidebar from "./Sidebar";

export default function DashboardLayout({ children, page, setPage }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0b1120",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <Sidebar page={page} setPage={setPage} />

      <main
        style={{
          flex: 1,
          background:
            "radial-gradient(circle at top left, rgba(59,130,246,0.08), transparent 28%), #f3f6fb",
          padding: "28px",
          overflow: "auto",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(15,23,42,0.06)",
            borderRadius: "22px",
            minHeight: "calc(100vh - 56px)",
            boxShadow: "0 20px 50px rgba(15,23,42,0.08)",
            padding: "28px",
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
