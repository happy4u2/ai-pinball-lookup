import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getInstanceHistory } from "../api/instances";

export default function InstanceDetail() {
  const { instanceId } = useParams();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadHistory() {
    if (!instanceId) {
      setError("Missing instance ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getInstanceHistory(instanceId);
      setHistory(data.history || []);
    } catch (err) {
      setError(err.message || "Failed to load service history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, [instanceId]);

  return (
    <div className="page">
      <h1>Machine Instance</h1>

      <p>
        Instance ID: <strong>{instanceId}</strong>
      </p>

      {error && <div className="error">{error}</div>}

      <div className="panel">
        <h2>Service History</h2>

        {loading ? (
          <p>Loading service history...</p>
        ) : history.length === 0 ? (
          <p>No service records found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Status</th>
                <th>Technician</th>
                <th>Labor</th>
                <th>Work Performed</th>
              </tr>
            </thead>

            <tbody>
              {history.map((item) => (
                <tr key={item.serviceId}>
                  <td>{item.serviceDate}</td>
                  <td>{item.serviceType}</td>
                  <td>{item.status}</td>
                  <td>{item.technician}</td>
                  <td>{item.laborCost}</td>
                  <td>{item.workPerformed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
