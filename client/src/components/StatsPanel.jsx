import React from "react";

/**
 * StatsPanel
 * Shows aggregated appointment statistics per specialization.
 */
function StatsPanel({ summary }) {
  if (!summary || summary.length === 0) return null;

  return (
    <div className="card card-wide">
      <div className="card-header">
        <span className="card-icon">📊</span>
        <h2 className="card-title">Specialization Summary</h2>
      </div>

      <div className="stats-grid">
        {summary.map((s) => {
          const fillPct = Math.round((s.totalAppointments / (s.totalCapacity || 1)) * 100);
          return (
            <div
              key={s.specialization}
              className={`stat-card ${s.availableDoctors === 0 ? "stat-card-full" : ""}`}
            >
              <div className="stat-spec">{s.specialization}</div>
              <div className="stat-row">
                <span className="stat-label">Appointments</span>
                <span className="stat-value">
                  {s.totalAppointments} / {s.totalCapacity}
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Doctors</span>
                <span className="stat-value">{s.totalDoctors}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Available</span>
                <span className={`stat-value ${s.availableDoctors === 0 ? "text-red" : "text-green"}`}>
                  {s.availableDoctors} / {s.totalDoctors}
                </span>
              </div>
              <div className="stat-bar-wrapper">
                <div
                  className={`stat-bar ${fillPct >= 100 ? "stat-bar-full" : fillPct >= 75 ? "stat-bar-high" : "stat-bar-low"}`}
                  style={{ width: `${Math.min(fillPct, 100)}%` }}
                />
              </div>
              <div className="stat-pct">{fillPct}% capacity used</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StatsPanel;
