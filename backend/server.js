import express from "express"; // server.js (touched for restart 2)
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import leadRoutes from "./routes/leads.js";
import productRoutes from "./routes/products.js";
import { connectDB } from "./config/db.js";
dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors()); // Enable CORS for all routes
app.use(express.json());


app.use(express.json());

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/users", authRoutes);
app.use("/api/leads", leadRoutes);

// Serve static files from the frontend build directory
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("/", (req, res) => {
  res.send("API is running");
});

// Handle React routing, return all requests to React app
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

connectDB();

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
