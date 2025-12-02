const express = require("express");
const router = express.Router();
const presensiController = require("../controllers/presensiController");
const { protect, addUserData, isAdmin } = require("../middleware/permissionMiddleware");

// ============================
// ENDPOINT PRESENSI
// ============================

// ✔ Protect dulu supaya req.user tersedia
// ✔ Upload setelah protect supaya req.user.id bisa dipakai
router.post(
  "/checkin",
  protect,
  addUserData,
  presensiController.upload.single("buktiFoto"),
  presensiController.CheckIn
);

router.post("/checkout", protect, addUserData, presensiController.CheckOut);

router.put("/:id", protect, presensiController.updatePresensi);

router.delete("/:id", protect, isAdmin, presensiController.hapusPresensi);

router.get("/search/nama", protect, presensiController.searchByName);
router.get("/search/tanggal", protect, presensiController.searchByDate);

module.exports = router;
