import express from "express";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import leadRoutes from "./routes/leads.js";
import productRoutes from "./routes/products.js";

// Security Packages
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security Middleware
app.use(helmet());

// Request Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(cors());
app.use(express.json());

// Data Sanitization
app.use(mongoSanitize());
app.use(xss());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use("/api", limiter);

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/users", authRoutes);
app.use("/api/leads", leadRoutes);

// Health Check Route
app.get("/api/health", (req, res) => {
  res.send("API is running");
});

// Serve static assets (Frontend)
// Serve static assets (Frontend)
const frontendPath = path.join(__dirname, "../frontend/dist");
console.log(`Frontend path: ${frontendPath}`);

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
} else {
  console.log("Frontend build not found. Please run npm run build.");
}

// Catch-all to serve React App
app.get(/.*/, (req, res) => {
  const indexPath = path.join(frontendPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Frontend not found. Please check deployment build steps.");
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

connectDB();

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
