import { useState } from "react";
import { createServiceRecord } from "../api";

export default function Service() {
  const [form, setForm] = useState({
    instanceId: "",
    customerId: "",
    machineId: "",
    serviceType: "repair",
    status: "completed",
    serviceDate: new Date().toISOString().slice(0, 10),
    technician: "David",
    laborCost: "",
    workPerformed: "",
    notes: "",
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function updateField(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      const data = await createServiceRecord({
        ...form,
        laborCost: form.laborCost ? Number(form.laborCost) : 0,
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <h1>Service Records</h1>
      <p>Create a service entry for a machine instance.</p>

      {error && <div className="error">{error}</div>}
      {result && <div className="success">Service record created: {result.serviceRecord?.serviceId}</div>}

      <div className="panel">
        <form onSubmit={handleSubmit} className="form-grid">
          <input name="instanceId" placeholder="Instance ID" value={form.instanceId} onChange={updateField} />
          <input name="customerId" placeholder="Customer ID" value={form.customerId} onChange={updateField} />
          <input name="machineId" placeholder="Machine ID" value={form.machineId} onChange={updateField} />
          <input name="technician" placeholder="Technician" value={form.technician} onChange={updateField} />
          <input name="serviceDate" type="date" value={form.serviceDate} onChange={updateField} />
          <input name="laborCost" type="number" placeholder="Labor Cost" value={form.laborCost} onChange={updateField} />

          <select name="serviceType" value={form.serviceType} onChange={updateField}>
            <option value="repair">repair</option>
            <option value="maintenance">maintenance</option>
            <option value="restoration">restoration</option>
            <option value="inspection">inspection</option>
          </select>

          <select name="status" value={form.status} onChange={updateField}>
            <option value="completed">completed</option>
            <option value="open">open</option>
            <option value="in_progress">in_progress</option>
          </select>

          <textarea name="workPerformed" placeholder="Work Performed" value={form.workPerformed} onChange={updateField} />
          <textarea name="notes" placeholder="Notes" value={form.notes} onChange={updateField} />

          <button type="submit">Create Service Record</button>
        </form>
      </div>
    </div>
  );
}