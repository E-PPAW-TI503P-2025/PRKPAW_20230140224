const express = require("express");
const router = express.Router();
const presensiController = require("../controllers/presensiController");
//const { addUserData, isAdmin } = require("../middleware/authMiddleware");
const { addUserData, isAdmin } = require('../middleware/permissionMiddleware');


// 🔹 Middleware global agar setiap request punya data user dummy
router.use(addUserData);

// ============================
// ENDPOINT PRESENSI
// ============================

// Check-in & Check-out
router.post("/checkin", presensiController.CheckIn);
router.post("/checkout", presensiController.CheckOut);

// Update data (PUT)
router.put("/:id", presensiController.updatePresensi);

// Delete data (Admin boleh hapus siapa pun)
router.delete("/:id", isAdmin, presensiController.deletePresensi);

// Search
router.get("/search/nama", presensiController.searchByName);
router.get("/search/tanggal", presensiController.searchByDate);

module.exports = router;
