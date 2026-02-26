import React, { useState } from "react";
import { doctorApi } from "../services/api";

function AddDoctorForm({ onDoctorAdded }) {
  const [form, setForm] = useState({
    doctorId: "",
    specialization: "",
    maxDailyPatients: "",
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.doctorId.trim() || !form.specialization.trim() || !form.maxDailyPatients) {
      setStatus({ type: "error", message: "All fields are required." });
      return;
    }
    if (parseInt(form.maxDailyPatients, 10) < 1) {
      setStatus({ type: "error", message: "Max daily patients must be at least 1." });
      return;
    }

    setLoading(true);
    const { ok, data } = await doctorApi.add(form);
    setLoading(false);

    if (ok && data.success) {
      setStatus({ type: "success", message: data.message });
      setForm({ doctorId: "", specialization: "", maxDailyPatients: "" });
      onDoctorAdded(); // refresh doctor list
    } else {
      setStatus({ type: "error", message: data.message || "Failed to add doctor." });
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-icon">🩺</span>
        <h2 className="card-title">Register Doctor</h2>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="doctorId">Doctor ID</label>
          <input
            id="doctorId"
            name="doctorId"
            type="text"
            placeholder="e.g. DR001"
            value={form.doctorId}
            onChange={handleChange}
            disabled={loading}
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <label htmlFor="specialization">Specialization</label>
          <input
            id="specialization"
            name="specialization"
            type="text"
            placeholder="e.g. Cardiology"
            value={form.specialization}
            onChange={handleChange}
            disabled={loading}
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <label htmlFor="maxDailyPatients">Max Daily Patients</label>
          <input
            id="maxDailyPatients"
            name="maxDailyPatients"
            type="number"
            min="1"
            placeholder="e.g. 10"
            value={form.maxDailyPatients}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner" /> : "Add Doctor"}
        </button>
      </form>

      {status && (
        <div className={`alert alert-${status.type}`} role="alert">
          {status.type === "success" ? "✅" : "❌"} {status.message}
        </div>
      )}
    </div>
  );
}

export default AddDoctorForm;
