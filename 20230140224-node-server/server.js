const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();
const PORT = 3001;
const authRoutes = require ('./routes/auth')
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(morgan("dev"));
app.use('/api/auth',authRoutes);

// Logging tambahan (optional)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Rute Root
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Selamat datang di API Server Book & Presensi!",
    availableEndpoints: ["/api/books", "/api/presensi", "/api/reports"],
  });
});

// Routing lama (books)
const bookRoutes = require("./routes/books");
app.use("/api/books", bookRoutes);

// Routing baru dari modul
const presensiRoutes = require("./routes/presensi");
const reportRoutes = require("./routes/reports");
app.use("/api/presensi", presensiRoutes);
app.use("/api/reports", reportRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Terjadi error:", err.stack);
  res.status(500).json({ message: "Terjadi kesalahan pada server" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/`);
});
