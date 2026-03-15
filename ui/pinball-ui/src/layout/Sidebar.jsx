import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const baseStyle = {
    display: "block",
    padding: "12px 14px",
    marginBottom: "8px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "500",
  };

  const getLinkStyle = ({ isActive }) => ({
    ...baseStyle,
    color: isActive ? "#ffffff" : "#d1d5db",
    backgroundColor: isActive ? "#374151" : "transparent",
  });

  return (
    <aside
      style={{
        width: "240px",
        minHeight: "100vh",
        backgroundColor: "#111827",
        color: "#ffffff",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ marginTop: 0 }}>SwissPinball</h2>

      <nav>
        <NavLink to="/" style={getLinkStyle}>
          Dashboard
        </NavLink>

        <NavLink to="/customers" style={getLinkStyle}>
          Customers
        </NavLink>

        <NavLink to="/machines" style={getLinkStyle}>
          Machines
        </NavLink>

        <NavLink to="/instances" style={getLinkStyle}>
          Instances
        </NavLink>

        <NavLink to="/service" style={getLinkStyle}>
          Service
        </NavLink>
      </nav>
    </aside>
  );
}
