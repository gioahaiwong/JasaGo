const express = require("express");

const cors = require("cors");
const cookieParser = require("cookie-parser");
const { db, dalamDatabase } = require("./database");
dalamDatabase(); // Panggil fungsi untuk membuat tabel jika belum ada

require("dotenv").config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Ganti dengan URL frontend Anda
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

const userRoutes = require("./userRoutes");
const serviceRoutes = require("./serviceRoutes");
const reviewRoutes = require("./reviewRoutes");
const orderRoutes = require("./orderRoutes");
const paymentRoutes = require("./paymentRoutes");
const adminRoutes = require("./adminRoutes");
const path = require("path");
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

app.get("/", (req, res) => {
  res.json({ message: "API is running :) !" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server is Error :o !" });
});

require("./cleanUpJob");
const PORT = process.env.PORT || 2500;
app.listen(PORT, () => {
  console.log(`Server is running on sigma port ${PORT}`);
  console.log(`🏠 Home: http://localhost:${PORT}/`);
});
