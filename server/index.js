import express from "express";
import authRoutes from "./src/routes/authRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import customerRoutes from "./src/routes/customerRoutes.js"
import cartRoutes from "./src/routes/cartRoutes.js"
import orderRoutes from "./src/routes/orderRoutes.js";
import addressRoutes from "./src/routes/addressRoutes.js"
import  wishlistRoutes from "./src/routes/wishlistRoutes.js";
import reviewRoutes from "./src/routes/reviewRoutes.js"
import publicRoutes from "./src/routes/publicRoutes.js"
import recentViewRoutes from "./src/routes/recentViewRoutes.js";
import offerRoutes from "./src/routes/offerRoutes.js"
import connectDB from "./src/config/db.js";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

const app = express();

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
app.use("/api/admin", productRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/public",publicRoutes);
app.use("/api/recent-views", recentViewRoutes);
app.use("/api", offerRoutes);

// Home Route
app.get("/", (req, res) => {
  res.json({ success: true, message: "Server Connected" });
});

app.use((req, res, next) => {
  console.log(`[LOG] ${req.method} ${req.path}`);
  next();
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