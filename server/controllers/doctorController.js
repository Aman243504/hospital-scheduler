/**
 * Doctor Controller — MongoDB Edition
 * All operations are now async, using Mongoose model directly.
 */

const Doctor = require("../models/Doctor");

const DoctorController = {
  /**
   * GET /api/doctors
   * Returns all doctors sorted by load percentage ascending
   */
  async getAllDoctors(req, res) {
    try {
      const doctors = await Doctor.find({}).lean();

      // Sort by load % (currentAppointments / maxDailyPatients)
      doctors.sort((a, b) => {
        const loadA = a.currentAppointments / a.maxDailyPatients;
        const loadB = b.currentAppointments / b.maxDailyPatients;
        return loadA - loadB;
      });

      res.json({ success: true, data: doctors, count: doctors.length });
    } catch (err) {
      console.error("getAllDoctors error:", err);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  },

  /**
   * POST /api/doctors
   * Add a new doctor — Mongoose handles schema validation
   */
  async addDoctor(req, res) {
    try {
      const { doctorId, specialization, maxDailyPatients } = req.body;

      // Basic presence check before hitting DB
      if (!doctorId?.toString().trim() || !specialization?.toString().trim() || maxDailyPatients === undefined || maxDailyPatients === "") {
        return res.status(400).json({ success: false, message: "All fields (doctorId, specialization, maxDailyPatients) are required." });
      }

      if (isNaN(maxDailyPatients) || parseInt(maxDailyPatients, 10) < 1) {
        return res.status(400).json({ success: false, message: "Max daily patients must be a positive integer (≥ 1)." });
      }

      const doctor = new Doctor({
        doctorId: doctorId.toString().trim(),
        specialization: specialization.toString().trim(),
        maxDailyPatients: parseInt(maxDailyPatients, 10),
      });

      const saved = await doctor.save();

      res.status(201).json({
        success: true,
        data: saved.toObject(),
        message: `Dr. ${saved.doctorId} (${saved.specialization}) added successfully.`,
      });
    } catch (err) {
      // MongoDB duplicate key error
      if (err.code === 11000) {
        return res.status(409).json({
          success: false,
          message: `Doctor with ID "${req.body.doctorId?.trim()}" already exists.`,
        });
      }
      // Mongoose validation error
      if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message).join(" ");
        return res.status(400).json({ success: false, message: messages });
      }
      console.error("addDoctor error:", err);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  },

  /**
   * POST /api/doctors/reset
   * Reset all currentAppointments to 0 for a new day
   */
  async resetDailyAppointments(req, res) {
    try {
      const result = await Doctor.updateMany({}, { $set: { currentAppointments: 0 } });
      res.json({
        success: true,
        message: `Daily appointments reset. ${result.modifiedCount} doctor(s) updated.`,
      });
    } catch (err) {
      console.error("resetDailyAppointments error:", err);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  },
};

module.exports = DoctorController;
