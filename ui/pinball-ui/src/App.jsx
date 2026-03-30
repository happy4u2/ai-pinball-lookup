import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Machines from "./pages/Machines";
import Instances from "./pages/Instances";
import InstanceDetail from "./pages/InstanceDetail";
import Service from "./pages/Service";

export default function App() {
  return (
<BrowserRouter>
  <DashboardLayout>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/machines" element={<Machines />} />
      <Route path="/instances" element={<Instances />} />
      <Route path="/instances/new" element={<Instances />} />
      <Route path="/instances/:instanceId" element={<InstanceDetail />} />
      <Route path="/service" element={<Service />} />
    </Routes>
  </DashboardLayout>
</BrowserRouter>
  );
}
