/**
 * API Routes
 * Centralizes all route definitions.
 */

const express = require("express");
const router = express.Router();

const DoctorController = require("../controllers/doctorController");
const AppointmentController = require("../controllers/appointmentController");

// --- Doctor Routes ---
router.get("/doctors", DoctorController.getAllDoctors);
router.post("/doctors", DoctorController.addDoctor);
router.post("/doctors/reset", DoctorController.resetDailyAppointments);

// --- Appointment Routes ---
router.post("/appointments/book", AppointmentController.bookAppointment);
router.get("/appointments/summary", AppointmentController.getSpecializationSummary);

module.exports = router;
