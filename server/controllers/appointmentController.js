/**
 * Appointment Controller — MongoDB Edition
 * All operations are async, delegating to AppointmentService.
 */

const AppointmentService = require("../services/appointmentService");

const AppointmentController = {
  /**
   * POST /api/appointments/book
   */
  async bookAppointment(req, res) {
    try {
      const { specialization } = req.body;

      if (!specialization || !specialization.trim()) {
        return res.status(400).json({
          success: false,
          message: "Specialization is required to book an appointment.",
        });
      }

      const result = await AppointmentService.bookAppointment(specialization);

      if (!result.success) {
        const statusCode = result.allFull ? 409 : 404;
        return res.status(statusCode).json(result);
      }

      res.status(200).json(result);
    } catch (err) {
      console.error("bookAppointment error:", err);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  },

  /**
   * GET /api/appointments/summary
   */
  async getSpecializationSummary(req, res) {
    try {
      const summary = await AppointmentService.getSpecializationSummary();
      res.json({ success: true, data: summary });
    } catch (err) {
      console.error("getSpecializationSummary error:", err);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  },
};

module.exports = AppointmentController;
