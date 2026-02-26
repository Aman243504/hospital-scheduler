/**
 * Doctor Model — Mongoose Schema
 *
 * Replaces the previous in-memory array store.
 * Data now persists in MongoDB Atlas across server restarts,
 * deployments, and multiple concurrent users.
 *
 * Collection name: "doctors" (Mongoose auto-pluralizes "Doctor")
 */

const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema(
  {
    doctorId: {
      type: String,
      required: [true, "Doctor ID is required"],
      unique: true,           // enforced at DB level — prevents race conditions
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
    },
    maxDailyPatients: {
      type: Number,
      required: [true, "Max daily patients is required"],
      min: [1, "Max daily patients must be at least 1"],
    },
    currentAppointments: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Index on specialization for fast lookups during booking
DoctorSchema.index({ specialization: 1 });

module.exports = mongoose.model("Doctor", DoctorSchema);
