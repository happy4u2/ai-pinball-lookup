import { useEffect, useState } from "react";
import { listInstances, createInstance } from "../api/instances";

export default function Instances() {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    machineId: "",
    machineName: "",
    instanceName: "",
    ownershipType: "customer",
    ownerCustomerId: "",
    currentLocationType: "workshop",
    currentLocationLabel: "",
    status: "active",
    condition: "good",
    notes: "",
  });

  async function loadInstances() {
    try {
      setLoading(true);
      setError("");

      const data = await listInstances();

      const instanceList = Array.isArray(data)
        ? data
        : Array.isArray(data.instances)
          ? data.instances
          : Array.isArray(data.items)
            ? data.items
            : [];

      setInstances(instanceList);
    } catch (err) {
      setError(err.message || "Failed to load instances");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInstances();
  }, []);

  function updateField(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      await createInstance(form);

      setForm({
        machineId: "",
        machineName: "",
        instanceName: "",
        ownershipType: "customer",
        ownerCustomerId: "",
        currentLocationType: "workshop",
        currentLocationLabel: "",
        status: "active",
        condition: "good",
        notes: "",
      });

      await loadInstances();
    } catch (err) {
      setError(err.message || "Failed to create instance");
    }
  }

  return (
    <div>
      <h1>Machine Instances</h1>
      <p>Create and manage real physical machines.</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Add Instance</h2>
        <p style={{ color: "#666", marginTop: 0 }}>
          Create a real machine record and assign its owner, status, and
          location.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gap: "12px",
            maxWidth: "700px",
          }}
        >
          <input
            name="machineId"
            placeholder="Machine ID"
            value={form.machineId}
            onChange={updateField}
          />

          <input
            name="machineName"
            placeholder="Machine Name"
            value={form.machineName}
            onChange={updateField}
          />

          <input
            name="instanceName"
            placeholder="Instance Name"
            value={form.instanceName}
            onChange={updateField}
          />

          <input
            name="ownerCustomerId"
            placeholder="Customer ID"
            value={form.ownerCustomerId}
            onChange={updateField}
          />

          <input
            name="currentLocationLabel"
            placeholder="Location Label"
            value={form.currentLocationLabel}
            onChange={updateField}
          />

          <select
            name="ownershipType"
            value={form.ownershipType}
            onChange={updateField}
          >
            <option value="customer">customer</option>
            <option value="swisspinball">swisspinball</option>
          </select>

          <select
            name="currentLocationType"
            value={form.currentLocationType}
            onChange={updateField}
          >
            <option value="workshop">workshop</option>
            <option value="customer_site">customer_site</option>
            <option value="storage">storage</option>
            <option value="on_rent">on_rent</option>
          </select>

          <select name="status" value={form.status} onChange={updateField}>
            <option value="active">active</option>
            <option value="repair">repair</option>
            <option value="rented">rented</option>
            <option value="stored">stored</option>
            <option value="in_service">in_service</option>
          </select>

          <select
            name="condition"
            value={form.condition}
            onChange={updateField}
          >
            <option value="excellent">excellent</option>
            <option value="good">good</option>
            <option value="fair">fair</option>
            <option value="project">project</option>
          </select>

          <textarea
            name="notes"
            placeholder="Notes"
            value={form.notes}
            onChange={updateField}
            rows={4}
          />

          <button type="submit">Create Instance</button>
        </form>
      </div>

      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Existing Instances</h2>

        {loading ? (
          <p>Loading...</p>
        ) : instances.length === 0 ? (
          <p>No instances found.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>Machine</th>
                <th style={thStyle}>Instance Name</th>
                <th style={thStyle}>Ownership</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Location</th>
              </tr>
            </thead>
            <tbody>
              {instances.map((item) => (
                <tr key={item.instanceId}>
                  <td style={tdStyle}>{item.machineName || "—"}</td>
                  <td style={tdStyle}>{item.instanceName || "—"}</td>
                  <td style={tdStyle}>{item.ownershipType || "—"}</td>
                  <td style={tdStyle}>{item.status || "—"}</td>
                  <td style={tdStyle}>
                    {item.currentLocationLabel ||
                      item.currentLocationType ||
                      "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
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
