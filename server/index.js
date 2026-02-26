/**
 * Hospital Appointment Scheduler — Express Server (MongoDB Edition)
 * Connects to MongoDB Atlas on startup before accepting requests.
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI; // support both names

// ── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ── Routes ───────────────────────────────────────────────────
app.use("/api", routes);

app.get("/health", (req, res) => {
  const dbState = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    status: "ok",
    database: dbState[mongoose.connection.readyState] || "unknown",
    timestamp: new Date().toISOString(),
  });
});

// ── 404 & Error Handlers ─────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error." });
});

// ── Connect to MongoDB, then start server ────────────────────
async function startServer() {
  if (!MONGO_URI) {
    console.error("❌ MONGODB_URI is not set. Please add it to your server/.env file.");
    console.error("   See .env.example for instructions.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI, {
      dbName: "hospital-scheduler", // explicit DB name
    });
    console.log("✅ Connected to MongoDB Atlas");

    app.listen(PORT, () => {
      console.log(`🏥 Hospital Scheduler API running on http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

// Handle connection drops gracefully
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected. Reconnecting...");
});

startServer();

module.exports = app;
