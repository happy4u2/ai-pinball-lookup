import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { listInstances, createInstance } from "../api/instances";
import { listCustomers } from "../api";

export default function Instances() {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState([]);
  const [searchParams] = useSearchParams();
  const [filterText, setFilterText] = useState("");
  const location = useLocation();
  const prefill = location.state || null;

  const [form, setForm] = useState({
    machineId: "",
    machineName: "",
    instanceName: "",
    serialNumber: "",
    ownershipType: "customer",
    ownerCustomerId: "",
    currentLocationType: "workshop",
    currentLocationLabel: "",
    status: "active",
    condition: "good",
    notes: "",
  });

  useEffect(() => {
    if (!prefill) return;

    setForm((prev) => ({
      ...prev,
      machineId: prefill.machineId || prev.machineId,
      machineName: prefill.machineName || prev.machineName,
      instanceName:
        prev.instanceName ||
        buildSuggestedInstanceName(
          prev.ownerCustomerId,
          prefill.machineName || prev.machineName,
        ),
    }));
  }, [prefill, customers]);
  function getCustomerLabel(customer) {
    if (!customer) return "";

    if (customer.name?.trim()) return customer.name;

    const fullName = [customer.firstName, customer.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (fullName) return fullName;

    if (customer.email?.trim()) return customer.email;
    if (customer.phone?.trim()) return customer.phone;

    return customer.customerId || "Unnamed customer";
  }
  function buildSuggestedInstanceName(customerId, machineName) {
    const customer = customers.find((c) => c.customerId === customerId);
    const customerLabel = getCustomerLabel(customer);

    if (customerLabel && machineName) {
      return `${customerLabel} ${machineName}`;
    }
    return machineName || "";
  }

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

  useEffect(() => {
    async function loadCustomersForDropdown() {
      try {
        const data = await listCustomers();
        setCustomers(data.customers || []);
      } catch (err) {
        // keep silent for now
      }
    }

    loadCustomersForDropdown();
  }, []);

  useEffect(() => {
    const machineId = searchParams.get("machineId") || "";
    const machineName = searchParams.get("machineName") || "";

    if (machineId || machineName) {
      setForm((prev) => ({
        ...prev,
        machineId,
        machineName,
        instanceName:
          prev.instanceName ||
          buildSuggestedInstanceName(prev.ownerCustomerId, machineName),
      }));
    }
  }, [searchParams, customers]);

  function getSuggestedLocationLabel(locationType, ownerCustomerId) {
  if (locationType === "workshop") {
    return "SwissPinball Workshop";
  }

  if (locationType === "storage") {
    return "Echallens Storage";
  }

  if (locationType === "customer_site") {
    const customer = customers.find((c) => c.customerId === ownerCustomerId);
    return getCustomerLabel(customer);
  }

  if (locationType === "on_rent") {
    return "";
  }

  return "";
}

  function updateField(e) {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "ownershipType" && value !== "customer") {
        updated.ownerCustomerId = "";

        if (
          !prev.instanceName.trim() ||
          prev.instanceName === prev.machineName
        ) {
          updated.instanceName = buildSuggestedInstanceName(
            "",
            prev.machineName,
          );
        }
      }

      if (name === "ownerCustomerId") {
        if (
          !prev.instanceName.trim() ||
          prev.instanceName === prev.machineName
        ) {
          updated.instanceName = buildSuggestedInstanceName(
            value,
            prev.machineName,
          );
        }

        if (prev.currentLocationType === "customer_site") {
          updated.currentLocationLabel = getSuggestedLocationLabel(
            prev.currentLocationType,
            value,
          );
        }
      }

      if (name === "currentLocationType") {
        if (
          !prev.currentLocationLabel.trim() ||
          prev.currentLocationLabel === "SwissPinball Workshop" ||
          prev.currentLocationLabel === "Echallens Storage"
        ) {
          updated.currentLocationLabel = getSuggestedLocationLabel(
            value,
            prev.ownerCustomerId,
          );
        }
      }

      return updated;
    });
  }

  const filteredInstances = useMemo(() => {
    const term = filterText.trim().toLowerCase();

    if (!term) return instances;

    return instances.filter((item) =>
      [
        item.machineName,
        item.instanceName,
        item.instanceId,
        item.currentLocationLabel,
        item.currentLocationType,
        item.status,
        item.ownershipType,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [instances, filterText]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.machineId.trim()) {
      setError("Machine ID is required.");
      return;
    }

    if (!form.machineName.trim()) {
      setError("Machine name is required.");
      return;
    }

    if (form.ownershipType === "customer") {
      const duplicate = instances.find(
        (i) =>
          i.ownerCustomerId === form.ownerCustomerId &&
          i.instanceName?.toLowerCase().trim() ===
            form.instanceName?.toLowerCase().trim(),
      );

      if (duplicate) {
        setError("This customer already has an instance with this name.");
        return;
      }
    }
    try {
      setError("");
      await createInstance(form);

      const machineId =
        searchParams.get("machineId") || prefill?.machineId || "";
      const machineName =
        searchParams.get("machineName") || prefill?.machineName || "";

      setForm({
        machineId,
        machineName,
        instanceName: "",
        serialNumber: "",
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

  const hasLockedMachine = Boolean(
    searchParams.get("machineId") ||
    searchParams.get("machineName") ||
    prefill?.machineId ||
    prefill?.machineName,
  );

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
          <div>
            <label>Machine ID</label>
            <input
              name="machineId"
              placeholder="Machine ID"
              value={form.machineId}
              onChange={updateField}
              readOnly={hasLockedMachine}
            />
          </div>

          <div>
            <label>Machine Name</label>
            <input
              name="machineName"
              placeholder="Machine Name"
              value={form.machineName}
              onChange={updateField}
              readOnly={hasLockedMachine}
            />
          </div>

          <div>
            <label>Instance Name</label>
            <input
              name="instanceName"
              placeholder="Instance Name"
              value={form.instanceName}
              onChange={updateField}
            />
          </div>

          <div>
            <label>Serial Number</label>
            <input
              name="serialNumber"
              placeholder="Serial Number"
              value={form.serialNumber}
              onChange={updateField}
            />
          </div>

          <div>
            <label>Ownership</label>
            <select
              name="ownershipType"
              value={form.ownershipType}
              onChange={updateField}
            >
              <option value="customer">customer</option>
              <option value="swisspinball">swisspinball</option>
            </select>
          </div>

          {form.ownershipType === "customer" && (
            <div>
              <label>Owner Customer</label>
              <select
                name="ownerCustomerId"
                value={form.ownerCustomerId}
                onChange={updateField}
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c.customerId} value={c.customerId}>
                    {getCustomerLabel(c)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label>Location Label</label>
            <input
              name="currentLocationLabel"
              placeholder="Location Label"
              value={form.currentLocationLabel}
              onChange={updateField}
            />
          </div>

          <div>
            <label>Location Type</label>
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
          </div>

          <div>
            <label>Status</label>
            <select name="status" value={form.status} onChange={updateField}>
              <option value="active">active</option>
              <option value="repair">repair</option>
              <option value="rented">rented</option>
              <option value="stored">stored</option>
              <option value="in_service">in_service</option>
            </select>
          </div>

          <div>
            <label>Condition</label>
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
          </div>

          <div>
            <label>Notes</label>
            <textarea
              name="notes"
              placeholder="Notes"
              value={form.notes}
              onChange={updateField}
              rows={4}
            />
          </div>

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            alignItems: "center",
            marginBottom: "12px",
            flexWrap: "wrap",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 0 }}>Existing Instances</h2>
          <input
            placeholder="Filter instances"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{ minWidth: "240px" }}
          />
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : filteredInstances.length === 0 ? (
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
              {filteredInstances.map((item) => (
                <tr key={item.instanceId}>
                  <td style={tdStyle}>
                    <Link
                      to={`/instances/${encodeURIComponent(item.instanceId)}`}
                      style={{
                        color: "#2563eb",
                        textDecoration: "none",
                        fontWeight: 600,
                      }}
                    >
                      {item.machineName || "—"}
                    </Link>
                  </td>
                  <td style={tdStyle}>
                    {item.instanceName || "—"}
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        marginTop: "4px",
                      }}
                    >
                      {item.instanceId || ""}
                    </div>
                  </td>
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
