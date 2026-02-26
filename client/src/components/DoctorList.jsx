import React from "react";

/**
 * DoctorList
 * Displays all doctors in a responsive table.
 * Highlights the last allocated doctor.
 * Doctors are pre-sorted by load (from API), AVAILABLE first.
 */
function DoctorList({ doctors, loading, lastAllocatedId }) {
  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <span className="card-icon">👨‍⚕️</span>
          <h2 className="card-title">Doctor Registry</h2>
        </div>
        <div className="loading-state">Loading doctors…</div>
      </div>
    );
  }

  return (
    <div className="card card-wide">
      <div className="card-header">
        <span className="card-icon">👨‍⚕️</span>
        <h2 className="card-title">
          Doctor Registry
          <span className="badge">{doctors.length}</span>
        </h2>
      </div>

      {doctors.length === 0 ? (
        <div className="empty-state">
          <p>No doctors registered yet.</p>
          <p>Add a doctor using the form to get started.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="doctor-table">
            <thead>
              <tr>
                <th>Doctor ID</th>
                <th>Specialization</th>
                <th>Slots Used</th>
                <th>Capacity</th>
                <th>Load</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => {
                const isFull = doc.currentAppointments >= doc.maxDailyPatients;
                const loadPct = Math.round(
                  (doc.currentAppointments / doc.maxDailyPatients) * 100
                );
                const isAllocated = doc.doctorId === lastAllocatedId;

                return (
                  <tr
                    key={doc.doctorId}
                    className={[
                      isFull ? "row-full" : "",
                      isAllocated ? "row-allocated" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <td>
                      <span className="doctor-id">{doc.doctorId}</span>
                      {isAllocated && (
                        <span className="allocated-badge">⚡ Allocated</span>
                      )}
                    </td>
                    <td>{doc.specialization}</td>
                    <td className="center">{doc.currentAppointments}</td>
                    <td className="center">{doc.maxDailyPatients}</td>
                    <td>
                      <div className="load-bar-wrapper">
                        <div className="load-bar-track">
                          <div
                            className={`load-bar ${
                              loadPct >= 100
                                ? "load-full"
                                : loadPct >= 75
                                ? "load-high"
                                : loadPct >= 40
                                ? "load-medium"
                                : "load-low"
                            }`}
                            style={{ width: `${Math.min(loadPct, 100)}%` }}
                          />
                        </div>
                        <span className="load-label">{loadPct}%</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          isFull ? "status-full" : "status-available"
                        }`}
                      >
                        {isFull ? "FULL" : "AVAILABLE"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DoctorList;
