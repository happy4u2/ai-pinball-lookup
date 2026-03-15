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

export default function CustomerForm() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await createCustomer(form);
      setResult(data);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>Create Customer</h2>

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

        <button type="submit">Create Customer</button>
      </form>

      {loading && <p>Saving...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <pre
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "#f4f4f4",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </section>
  );
}