import MachineSearch from "./components/MachineSearch";
import CustomerForm from "./components/CustomerForm";

export default function App() {
  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>SwissPinball UI</h1>
      <p>Frontend MVP for machine lookup and customer intake.</p>

      <MachineSearch />
      <CustomerForm />
    </main>
  );
}