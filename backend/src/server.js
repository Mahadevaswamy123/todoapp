import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error(
    "JWT_SECRET must be set to a random string of at least 32 characters.",
  );
  process.exit(1);
}
app.use(
  cors({
    origin:
      process.env.CLIENT_ORIGIN === "*"
        ? true
        : process.env.CLIENT_ORIGIN?.split(",").map((s) => s.trim()) || true,
  }),
);

app.use(express.json({ limit: "100kb" }));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "TaskFlow API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.use((req, res) => {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.path}` });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.status ? err.message : "Internal server error",
  });
});

try {
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TaskFlow API listening on http://0.0.0.0:${PORT}`);
  });
} catch (error) {
  console.error("Could not connect to MongoDB:", error.message);
  process.exit(1);
}
