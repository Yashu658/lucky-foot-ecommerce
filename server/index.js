import express from "express";
import authRoutes from "./src/routes/authRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import connectDB from "./src/config/db.js";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

const app = express();

// Built-in Middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Home Route
app.get("/", (req, res) => {
  res.json({ success: true, message: "Server Connected" });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log("Server Started at Port", port);
  connectDB();
});