/**
 * API Service
 * Centralized HTTP client for all backend communication.
 * Swap BASE_URL for production deployment.
 */

const BASE_URL = process.env.REACT_APP_API_URL || "/api";

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: { success: false, message: "Network error. Is the server running?" },
    };
  }
}

// --- Doctor API ---
export const doctorApi = {
  getAll: () => apiFetch("/doctors"),
  add: (doctor) =>
    apiFetch("/doctors", { method: "POST", body: JSON.stringify(doctor) }),
  resetDaily: () => apiFetch("/doctors/reset", { method: "POST" }),
};

// --- Appointment API ---
export const appointmentApi = {
  book: (specialization) =>
    apiFetch("/appointments/book", {
      method: "POST",
      body: JSON.stringify({ specialization }),
    }),
  getSummary: () => apiFetch("/appointments/summary"),
};
