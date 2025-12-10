import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import leadRoutes from "./routes/leads.js";
import productRoutes from "./routes/products.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Request Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/users", authRoutes);
app.use("/api/leads", leadRoutes);

// Health Check Route
app.get("/api/health", (req, res) => {
  res.send("API is running");
});

// Serve static assets (Frontend)
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Catch-all to serve React App
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

connectDB();

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
