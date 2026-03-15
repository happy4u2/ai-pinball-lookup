import { useState } from "react";
import DashboardLayout from "./layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Machines from "./pages/Machines";
import Customers from "./pages/Customers";

export default function App() {
  const [page, setPage] = useState("dashboard");

  function renderPage() {
    switch (page) {
      case "machines":
        return <Machines />;
      case "customers":
        return <Customers />;
      default:
        return <Dashboard />;
    }
  }

  return (
    <DashboardLayout page={page} setPage={setPage}>
      {renderPage()}
    </DashboardLayout>
  );
}