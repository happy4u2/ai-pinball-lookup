import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  createServiceRecord,
  getInstance,
  getInstanceHistory,
  updateInstance,
  listCustomers,
} from "../api";

const panelStyle = {
  background: "white",
  borderRadius: "18px",
  padding: "22px",
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
  border: "1px solid rgba(15,23,42,0.05)",
};

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "#eff6ff",
  color: "#1d4ed8",
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const emptyServiceForm = {
  serviceDate: new Date().toISOString().slice(0, 10),
  technician: "",
  serviceType: "repair",
  workLocation: "workshop",
  status: "completed",
  customerReportedIssue: "",
  diagnosis: "",
  workPerformed: "",
  technicianNotes: "",
  timeSpentHours: "",
  travelDistanceKm: "",
  followUpNeeded: false,
  nextAction: "",
};

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

function formatEnumLabel(value = "") {
  if (!value) return "—";

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function InstanceDetail() {
  const { instanceId } = useParams();

  const [instance, setInstance] = useState(null);
  const [history, setHistory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serviceError, setServiceError] = useState("");
  const [serviceSuccess, setServiceSuccess] = useState("");
  const [savingService, setSavingService] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [form, setForm] = useState(emptyServiceForm);

  const quickStatuses = useMemo(
    () => [
      "active",
      "in_service",
      "awaiting_parts",
      "ready",
      "stored",
      "rented",
    ],
    [],
  );

  const ownerLabel = useMemo(() => {
    if (!instance) return "—";

    const ownerId =
      instance.ownerCustomerId ||
      instance.customerId ||
      instance.assignedCustomerId ||
      "";

    if (!ownerId) {
      return "SwissPinball / internal";
    }

    const customer = customers.find((c) => c.customerId === ownerId);
    return getCustomerLabel(customer) || ownerId;
  }, [instance, customers]);

  async function loadAll() {
    if (!instanceId) {
      setError("Missing instance ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [instanceData, historyData, customerData] = await Promise.all([
        getInstance(instanceId),
        getInstanceHistory(instanceId),
        listCustomers(),
      ]);

      setInstance(instanceData.instance || null);
      setHistory(historyData.history || []);
      setCustomers(customerData.customers || []);
    } catch (err) {
      setError(err.message || "Failed to load instance details");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, [instanceId]);

  function updateField(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleServiceSubmit(e) {
    e.preventDefault();

    if (!instance) {
      setServiceError("Instance details are not loaded yet.");
      return;
    }

    try {
      setSavingService(true);
      setServiceError("");
      setServiceSuccess("");

      await createServiceRecord({
        instanceId: instance.instanceId,
        customerId:
          instance.customerId ||
          instance.ownerCustomerId ||
          instance.assignedCustomerId ||
          "",
        machineId: instance.machineId || "",
        serviceDate: form.serviceDate,
        technician: form.technician,
        serviceType: form.serviceType,
        workLocation: form.workLocation,
        status: form.status,
        customerReportedIssue: form.customerReportedIssue,
        diagnosis: form.diagnosis,
        workPerformed: form.workPerformed,
        technicianNotes: form.technicianNotes,
        timeSpentHours: Number(form.timeSpentHours || 0),
        travelDistanceKm: Number(form.travelDistanceKm || 0),
        followUpNeeded: form.followUpNeeded,
        nextAction: form.nextAction,
      });

      setForm({
        ...emptyServiceForm,
        serviceDate: new Date().toISOString().slice(0, 10),
      });

      setServiceSuccess("Service record created.");
      await loadAll();
    } catch (err) {
      setServiceError(err.message || "Failed to create service record");
    } finally {
      setSavingService(false);
    }
  }

  async function handleQuickStatusChange(nextStatus) {
    if (!instance || nextStatus === instance.status) return;

    try {
      setSavingStatus(true);
      setError("");
      const data = await updateInstance(instance.instanceId, {
        status: nextStatus,
      });
      setInstance(data.instance || null);
    } catch (err) {
      setError(err.message || "Failed to update instance status");
    } finally {
      setSavingStatus(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            fontSize: "13px",
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            fontWeight: 700,
          }}
        >
          Instance Detail
        </div>
        <h1 style={{ margin: "8px 0 0", color: "#0f172a" }}>
          {instance?.instanceName ||
            instance?.machineName ||
            "Machine Instance"}
        </h1>
        <p style={{ marginTop: "8px", color: "#475569" }}>
          Full workshop view for one physical machine, including quick status
          changes and service history.
        </p>
      </div>

      {error && (
        <div style={{ color: "#b91c1c", marginBottom: "16px" }}>{error}</div>
      )}

      {loading ? (
        <div style={panelStyle}>Loading instance details...</div>
      ) : !instance ? (
        <div style={panelStyle}>Instance not found.</div>
      ) : (
        <div style={{ display: "grid", gap: "18px" }}>
          <div style={{ ...panelStyle, display: "grid", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    flexWrap: "wrap",
                    marginBottom: "10px",
                  }}
                >
                  <span style={badgeStyle}>
                    {formatEnumLabel(instance.status || "unknown")}
                  </span>
                  <span
                    style={{
                      ...badgeStyle,
                      background: "#f8fafc",
                      color: "#334155",
                    }}
                  >
                    {formatEnumLabel(
                      instance.currentLocationLabel ||
                        instance.currentLocationType ||
                        "unknown",
                    )}
                  </span>
                </div>
                <div style={{ fontSize: "14px", color: "#64748b" }}>
                  Instance ID
                </div>
                <div style={{ fontFamily: "monospace", color: "#0f172a" }}>
                  {instance.instanceId}
                </div>
              </div>

              <div>
                <Link
                  to="/instances"
                  style={{
                    color: "#2563eb",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  ← Back to instances
                </Link>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px",
              }}
            >
              <Info label="Machine" value={instance.machineName} />
              <Info label="Instance name" value={instance.instanceName} />
              <Info label="Machine ID" value={instance.machineId} mono />
              <Info label="Owner" value={ownerLabel} />
              <Info
                label="Location"
                value={
                  instance.currentLocationLabel || instance.currentLocationType
                }
              />
              <Info label="Condition" value={instance.condition} />
            </div>

            <div>
              <div
                style={{
                  fontWeight: 700,
                  color: "#0f172a",
                  marginBottom: "10px",
                }}
              >
                Quick status
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {quickStatuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleQuickStatusChange(status)}
                    disabled={savingStatus || status === instance.status}
                    style={{
                      borderRadius: "999px",
                      border:
                        status === instance.status
                          ? "1px solid #1d4ed8"
                          : "1px solid #cbd5e1",
                      background:
                        status === instance.status ? "#dbeafe" : "white",
                      color: "#0f172a",
                      padding: "8px 14px",
                      cursor:
                        status === instance.status ? "default" : "pointer",
                    }}
                  >
                    {formatEnumLabel(status)}
                  </button>
                ))}
              </div>
            </div>

            {instance.notes ? (
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    color: "#0f172a",
                    marginBottom: "6px",
                  }}
                >
                  Notes
                </div>
                <div style={{ color: "#475569", lineHeight: 1.6 }}>
                  {instance.notes}
                </div>
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 1fr",
              gap: "18px",
            }}
          >
            <div style={panelStyle}>
              <h2 style={{ marginTop: 0, color: "#0f172a" }}>
                Service History
              </h2>
              <p style={{ color: "#64748b", marginTop: 0 }}>
                Newest records first.
              </p>

              {history.length === 0 ? (
                <p>No service records found yet.</p>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {history.map((item) => (
                    <div
                      key={item.serviceId}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "14px",
                        background: "#f8fafc",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#0f172a",
                          marginBottom: "8px",
                        }}
                      >
                        {item.serviceDate || "No date"} —{" "}
                        {formatEnumLabel(item.serviceType || "repair")} —{" "}
                        {formatEnumLabel(item.status || "completed")}
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gap: "6px",
                          color: "#475569",
                          marginBottom: "10px",
                        }}
                      >
                        <div>
                          <strong>Technician:</strong> {item.technician || "—"}
                        </div>
                        <div>
                          <strong>Location:</strong>{" "}
                          {formatEnumLabel(item.workLocation || "workshop")}
                        </div>
                        <div>
                          <strong>Time:</strong>{" "}
                          {item.timeSpentHours ? `${item.timeSpentHours} h` : "—"}
                        </div>
                        <div>
                          <strong>Travel:</strong>{" "}
                          {item.travelDistanceKm
                            ? `${item.travelDistanceKm} km`
                            : "—"}
                        </div>
                        <div>
                          <strong>Follow-up needed:</strong>{" "}
                          {item.followUpNeeded ? "Yes" : "No"}
                        </div>
                      </div>

                      {item.customerReportedIssue ? (
                        <Section
                          title="Customer reported issue"
                          value={item.customerReportedIssue}
                        />
                      ) : null}

                      {item.diagnosis ? (
                        <Section title="Diagnosis" value={item.diagnosis} />
                      ) : null}

                      {item.workPerformed ? (
                        <Section
                          title="Work performed"
                          value={item.workPerformed}
                        />
                      ) : null}

                      {item.technicianNotes ? (
                        <Section
                          title="Technician notes"
                          value={item.technicianNotes}
                        />
                      ) : null}

                      {item.nextAction ? (
                        <Section title="Next action" value={item.nextAction} />
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={panelStyle}>
              <h2 style={{ marginTop: 0, color: "#0f172a" }}>
                Add Service Record
              </h2>
              <p style={{ color: "#64748b", marginTop: 0 }}>
                This is tied directly to the current instance.
              </p>

              {serviceError && (
                <div style={{ color: "#b91c1c", marginBottom: "12px" }}>
                  {serviceError}
                </div>
              )}
              {serviceSuccess && (
                <div style={{ color: "#15803d", marginBottom: "12px" }}>
                  {serviceSuccess}
                </div>
              )}

              <form
                onSubmit={handleServiceSubmit}
                style={{ display: "grid", gap: "12px" }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <select
                    name="serviceType"
                    value={form.serviceType}
                    onChange={updateField}
                  >
                    <option value="repair">repair</option>
                    <option value="diagnostic">diagnostic</option>
                    <option value="revision">revision</option>
                    <option value="maintenance">maintenance</option>
                    <option value="restoration">restoration</option>
                    <option value="inspection">inspection</option>
                    <option value="installation">installation</option>
                    <option value="pickup">pickup</option>
                    <option value="delivery">delivery</option>
                    <option value="remote_support">remote_support</option>
                    <option value="parts_followup">parts_followup</option>
                  </select>

                  <select
                    name="status"
                    value={form.status}
                    onChange={updateField}
                  >
                    <option value="completed">completed</option>
                    <option value="open">open</option>
                    <option value="in_progress">in_progress</option>
                    <option value="awaiting_parts">awaiting_parts</option>
                    <option value="monitoring">monitoring</option>
                    <option value="quoted">quoted</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <select
                    name="workLocation"
                    value={form.workLocation}
                    onChange={updateField}
                  >
                    <option value="workshop">workshop</option>
                    <option value="customer_site">customer_site</option>
                    <option value="remote">remote</option>
                  </select>

                  <input
                    name="serviceDate"
                    type="date"
                    value={form.serviceDate}
                    onChange={updateField}
                  />
                </div>

                <input
                  name="technician"
                  placeholder="Technician"
                  value={form.technician}
                  onChange={updateField}
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <input
                    type="number"
                    step="0.1"
                    name="timeSpentHours"
                    placeholder="Time spent (hours)"
                    value={form.timeSpentHours}
                    onChange={updateField}
                  />

                  <input
                    type="number"
                    step="0.1"
                    name="travelDistanceKm"
                    placeholder="Travel distance (km)"
                    value={form.travelDistanceKm}
                    onChange={updateField}
                  />
                </div>

                <textarea
                  name="customerReportedIssue"
                  placeholder="Customer reported issue"
                  rows={3}
                  value={form.customerReportedIssue}
                  onChange={updateField}
                />

                <textarea
                  name="diagnosis"
                  placeholder="Diagnosis"
                  rows={3}
                  value={form.diagnosis}
                  onChange={updateField}
                />

                <textarea
                  name="workPerformed"
                  placeholder="Work performed"
                  rows={4}
                  value={form.workPerformed}
                  onChange={updateField}
                />

                <textarea
                  name="technicianNotes"
                  placeholder="Technician notes"
                  rows={3}
                  value={form.technicianNotes}
                  onChange={updateField}
                />

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    color: "#0f172a",
                  }}
                >
                  <input
                    type="checkbox"
                    name="followUpNeeded"
                    checked={form.followUpNeeded}
                    onChange={updateField}
                  />
                  Follow-up needed
                </label>

                <input
                  name="nextAction"
                  placeholder="Next action"
                  value={form.nextAction}
                  onChange={updateField}
                />

                <button type="submit" disabled={savingService}>
                  {savingService ? "Saving..." : "Create Service Record"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, value }) {
  return (
    <div style={{ marginTop: "10px" }}>
      <div
        style={{
          fontWeight: 700,
          color: "#0f172a",
          marginBottom: "4px",
        }}
      >
        {title}
      </div>
      <div style={{ color: "#475569", lineHeight: 1.6 }}>{value}</div>
    </div>
  );
}

function Info({ label, value, mono = false }) {
  return (
    <div
      style={{
        background: "#f8fafc",
        borderRadius: "12px",
        padding: "14px",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#64748b",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>
      <div
        style={{ color: "#0f172a", fontFamily: mono ? "monospace" : "inherit" }}
      >
        {value || "—"}
      </div>
    </div>
  );
}