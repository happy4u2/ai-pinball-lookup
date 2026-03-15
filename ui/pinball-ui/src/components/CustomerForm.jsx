import { useState } from "react";
import { createCustomer } from "../api";

const initialForm = {
  firstName: "Susy",
  lastName: "D’Anto",
  addressLine1: "Route de Bussy 4",
  postalCode: "1136",
  city: "Bussy-Chardonney",
  phone: "0792024050",
  email: "susy.danto@icloud.com",
  notes: "Owns Williams Black Knight 2000. Requested quote.",
};

export default function CustomerForm({ onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const data = await createCustomer(form);

      setSuccessMessage(
        `Customer created: ${data?.customer?.name || "Success"}`
      );

      if (onCreated) {
        await onCreated();
      }

      setForm(initialForm);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Create Customer</h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "0.75rem",
          maxWidth: "600px",
        }}
      >
        <input
          value={form.firstName}
          onChange={(e) => updateField("firstName", e.target.value)}
          placeholder="First name"
        />

        <input
          value={form.lastName}
          onChange={(e) => updateField("lastName", e.target.value)}
          placeholder="Last name"
        />

        <input
          value={form.addressLine1}
          onChange={(e) => updateField("addressLine1", e.target.value)}
          placeholder="Address"
        />

        <input
          value={form.postalCode}
          onChange={(e) => updateField("postalCode", e.target.value)}
          placeholder="Postal code"
        />

        <input
          value={form.city}
          onChange={(e) => updateField("city", e.target.value)}
          placeholder="City"
        />

        <input
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          placeholder="Phone"
        />

        <input
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="Email"
        />

        <textarea
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          placeholder="Notes"
          rows={4}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create Customer"}
        </button>
      </form>

      {successMessage && (
        <p style={{ color: "green", marginTop: "1rem" }}>{successMessage}</p>
      )}

      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
    </section>
  );
}