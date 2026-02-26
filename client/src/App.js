import React, { useState, useEffect, useCallback } from "react";
import AddDoctorForm from "./components/AddDoctorForm";
import DoctorList from "./components/DoctorList";
import BookingPanel from "./components/BookingPanel";
import StatsPanel from "./components/StatsPanel";
import { doctorApi, appointmentApi } from "./services/api";
import "./styles/global.css";

/**
 * App - Root Component
 * Manages global state and coordinates data fetching.
 */
function App() {
  const [doctors, setDoctors] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [lastAllocatedId, setLastAllocatedId] = useState(null);
  const [resetStatus, setResetStatus] = useState(null);

  const fetchDoctors = useCallback(async () => {
    const { ok, data } = await doctorApi.getAll();
    if (ok && data.success) setDoctors(data.data);
    setLoadingDoctors(false);
  }, []);

  const fetchSummary = useCallback(async () => {
    const { ok, data } = await appointmentApi.getSummary();
    if (ok && data.success) setSummary(data.data);
  }, []);

  const refreshAll = useCallback(() => {
    fetchDoctors();
    fetchSummary();
  }, [fetchDoctors, fetchSummary]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handleBookingComplete = (allocatedDoctorId) => {
    setLastAllocatedId(allocatedDoctorId);
    refreshAll();
    // Clear the highlight after 5 seconds
    setTimeout(() => setLastAllocatedId(null), 5000);
  };

  const handleReset = async () => {
    const { ok, data } = await doctorApi.resetDaily();
    if (ok) {
      setResetStatus("✅ Daily appointments reset.");
      refreshAll();
      setTimeout(() => setResetStatus(null), 3000);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <span className="header-cross">✚</span>
            <div>
              <h1>Hospital Appointment Scheduler</h1>
              <p>Intelligent load-balanced doctor allocation system</p>
            </div>
          </div>
          <div className="header-actions">
            {resetStatus && <span className="reset-msg">{resetStatus}</span>}
            <button className="btn btn-ghost" onClick={handleReset} title="Reset all daily appointments">
              ↺ Reset Day
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {/* Stats Panel (full width) */}
        <StatsPanel summary={summary} />

        {/* Two-column: Add Doctor + Book Appointment */}
        <div className="two-col">
          <AddDoctorForm onDoctorAdded={refreshAll} />
          <BookingPanel doctors={doctors} onBookingComplete={handleBookingComplete} />
        </div>

        {/* Doctor List (full width) */}
        <DoctorList
          doctors={doctors}
          loading={loadingDoctors}
          lastAllocatedId={lastAllocatedId}
        />
      </main>

      <footer className="app-footer">
        <p>Hospital Appointment Scheduler — Built with React + Node.js + Express</p>
        <p>Minimum-Load Allocation Strategy • Production-Ready Architecture</p>
      </footer>
    </div>
  );
}

export default App;
