import React, { useState } from "react";
import { appointmentApi } from "../services/api";


function BookingPanel({ doctors, onBookingComplete }) {
  const [specialization, setSpecialization] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Derive unique specializations from available doctors for a helpful datalist
  const specializations = [...new Set(doctors.map((d) => d.specialization))].sort();

  // Check if all doctors for a given specialization are full
  const isSpecFull = (spec) => {
    if (!spec.trim()) return false;
    const matching = doctors.filter(
      (d) => d.specialization.toLowerCase() === spec.toLowerCase()
    );
    return matching.length > 0 && matching.every(
      (d) => d.currentAppointments >= d.maxDailyPatients
    );
  };

  const allFull = isSpecFull(specialization);

  const handleBook = async () => {
    if (!specialization.trim()) {
      setResult({ success: false, message: "Please enter a specialization." });
      return;
    }

    setLoading(true);
    const { data } = await appointmentApi.book(specialization.trim());
    setLoading(false);
    setResult(data);

    if (data.success) {
      onBookingComplete(data.doctor?.doctorId);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-icon">📅</span>
        <h2 className="card-title">Book Appointment</h2>
      </div>

      <div className="form-group">
        <label htmlFor="spec-input">Specialization</label>
        <input
          id="spec-input"
          type="text"
          list="spec-list"
          placeholder="e.g. Cardiology"
          value={specialization}
          onChange={(e) => {
            setSpecialization(e.target.value);
            setResult(null);
          }}
          disabled={loading}
          autoComplete="off"
        />
        <datalist id="spec-list">
          {specializations.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>

      {allFull && (
        <div className="alert alert-warning">
          ⚠️ All doctors for <strong>{specialization}</strong> are fully booked today.
        </div>
      )}

      <button
        className="btn btn-success"
        onClick={handleBook}
        disabled={loading || allFull}
        title={allFull ? "No available slots for this specialization" : "Book appointment"}
      >
        {loading ? <span className="spinner" /> : "Book Appointment"}
      </button>

      {/* Result display */}
      {result && (
        <div
          className={`result-panel ${result.success ? "result-success" : "result-error"}`}
        >
          {result.success ? (
            <>
              <div className="result-icon">✅</div>
              <div className="result-title">Appointment Confirmed!</div>
              <div className="result-detail">{result.message}</div>
              {result.doctor && (
                <div className="result-meta">
                  <span>Doctor: <strong>{result.doctor.doctorId}</strong></span>
                  <span>Specialization: <strong>{result.doctor.specialization}</strong></span>
                  <span>
                    Slot: <strong>{result.doctor.currentAppointments}</strong> / {result.doctor.maxDailyPatients}
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="result-icon">❌</div>
              <div className="result-title">Booking Failed</div>
              <div className="result-detail">{result.message}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default BookingPanel;
