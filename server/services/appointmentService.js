/**
 * Appointment Service — MongoDB Edition
 *
 * Core booking logic implementing a MINIMUM-LOAD ALLOCATION strategy.
 * All methods are now async/await to work with MongoDB via Mongoose.
 *
 * Algorithm (unchanged — now runs against real DB):
 * ─────────────────────────────────────────────────────────────────────
 * 1. Find all doctors with matching specialization from MongoDB
 * 2. Filter out fully-booked ones
 * 3. Sort by currentAppointments ASC, tie-break by doctorId (deterministic)
 * 4. Pick the first (least loaded) doctor
 * 5. Atomically increment their currentAppointments using findOneAndUpdate
 *    with $inc — this prevents race conditions when two users book at once
 * ─────────────────────────────────────────────────────────────────────
 */

const Doctor = require("../models/Doctor");

const AppointmentService = {
  /**
   * Book an appointment for a given specialization.
   * Returns { success, doctor, message }
   */
  async bookAppointment(specialization) {
    if (!specialization || !specialization.trim()) {
      return { success: false, message: "Specialization is required." };
    }

    // Step 1: Find all doctors with matching specialization (case-insensitive)
    const matchingDoctors = await Doctor.find({
      specialization: new RegExp(`^${specialization.trim()}$`, "i"),
    }).lean(); // .lean() returns plain JS objects — faster for read-only use

    if (matchingDoctors.length === 0) {
      return {
        success: false,
        message: `No doctors found for specialization: "${specialization}". Please check the specialization name.`,
      };
    }

    // Step 2: Filter to only available doctors
    const availableDoctors = matchingDoctors.filter(
      (d) => d.currentAppointments < d.maxDailyPatients
    );

    if (availableDoctors.length === 0) {
      return {
        success: false,
        message: `All ${matchingDoctors.length} doctor(s) for "${specialization}" are fully booked for today. Please try again tomorrow.`,
        allFull: true,
      };
    }

    // Step 3: Sort by minimum load, deterministic tie-break by doctorId
    const sortedDoctors = [...availableDoctors].sort((a, b) => {
      const loadDiff = a.currentAppointments - b.currentAppointments;
      if (loadDiff !== 0) return loadDiff;
      return a.doctorId.localeCompare(b.doctorId);
    });

    const selectedDoctor = sortedDoctors[0];

    // Step 4: Atomically increment using $inc — safe against concurrent requests
    const updatedDoctor = await Doctor.findOneAndUpdate(
      {
        doctorId: selectedDoctor.doctorId,
        currentAppointments: { $lt: selectedDoctor.maxDailyPatients }, // safety check
      },
      { $inc: { currentAppointments: 1 } },
      { new: true, lean: true } // return updated document
    );

    // Edge case: doctor was filled between our read and write (race condition)
    if (!updatedDoctor) {
      return {
        success: false,
        message: `Booking conflict — please try again. The selected doctor was just fully booked.`,
      };
    }

    return {
      success: true,
      doctor: updatedDoctor,
      message: `Appointment successfully booked with Dr. ${updatedDoctor.doctorId} (${updatedDoctor.specialization}). Slot ${updatedDoctor.currentAppointments} of ${updatedDoctor.maxDailyPatients}.`,
    };
  },

  /**
   * Get appointment summary grouped by specialization.
   * Uses MongoDB aggregation pipeline for efficiency.
   */
  async getSpecializationSummary() {
    const summary = await Doctor.aggregate([
      {
        $group: {
          _id: "$specialization",
          totalDoctors: { $sum: 1 },
          totalAppointments: { $sum: "$currentAppointments" },
          totalCapacity: { $sum: "$maxDailyPatients" },
          availableDoctors: {
            $sum: {
              $cond: [
                { $lt: ["$currentAppointments", "$maxDailyPatients"] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          specialization: "$_id",
          totalDoctors: 1,
          totalAppointments: 1,
          totalCapacity: 1,
          availableDoctors: 1,
        },
      },
      { $sort: { specialization: 1 } },
    ]);

    return summary;
  },
};

module.exports = AppointmentService;
