const { Presensi } = require("../models");
const { format } = require("date-fns-tz");
const { Op } = require("sequelize");
const { validationResult } = require("express-validator");
const timeZone = "Asia/Jakarta";

// ============================
// CHECK-IN
// ============================
exports.CheckIn = async (req, res) => {
  try {
    const { id: userId, nama: userName } = req.user;
    const waktuSekarang = new Date();

    const existingRecord = await Presensi.findOne({
      where: { userId, checkOut: null },
    });

    if (existingRecord) {
      return res.status(400).json({
        message: "Anda sudah melakukan check-in hari ini.",
      });
    }

    const newRecord = await Presensi.create({
      userId,
      nama: userName,
      checkIn: waktuSekarang,
    });

    const formattedData = {
      userId: newRecord.userId,
      nama: newRecord.nama,
      checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      checkOut: null,
    };

    res.status(201).json({
      message: `Halo ${userName}, check-in Anda berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
      data: formattedData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// ============================
// CHECK-OUT
// ============================
exports.CheckOut = async (req, res) => {
  try {
    const { id: userId, nama: userName } = req.user;
    const waktuSekarang = new Date();

    const recordToUpdate = await Presensi.findOne({
      where: { userId, checkOut: null },
    });

    if (!recordToUpdate) {
      return res.status(404).json({
        message: "Tidak ditemukan catatan check-in yang aktif untuk Anda.",
      });
    }

    recordToUpdate.checkOut = waktuSekarang;
    await recordToUpdate.save();

    const formattedData = {
      userId: recordToUpdate.userId,
      nama: recordToUpdate.nama,
      checkIn: format(recordToUpdate.checkIn, "yyyy-MM-dd HH:mm:ssXXX", {
        timeZone,
      }),
      checkOut: format(recordToUpdate.checkOut, "yyyy-MM-dd HH:mm:ssXXX", {
        timeZone,
      }),
    };

    res.json({
      message: `Selamat jalan ${userName}, check-out Anda berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
      data: formattedData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// ============================
// UPDATE DATA PRESENSI (PUT)
// ============================
exports.updatePresensi = async (req, res) => {
  try {
    // 🔹 Ambil hasil validasi dari express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const presensiId = req.params.id;
    const { checkIn, checkOut, nama } = req.body;

    const recordToUpdate = await Presensi.findByPk(presensiId);
    if (!recordToUpdate) {
      return res.status(404).json({ message: "Catatan presensi tidak ditemukan." });
    }

    recordToUpdate.checkIn = checkIn || recordToUpdate.checkIn;
    recordToUpdate.checkOut = checkOut || recordToUpdate.checkOut;
    recordToUpdate.nama = nama || recordToUpdate.nama;
    await recordToUpdate.save();

    res.json({
      message: "Data presensi berhasil diperbarui.",
      data: recordToUpdate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// ============================
// DELETE DATA PRESENSI
// ============================
exports.deletePresensi = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const presensiId = req.params.id;

    const recordToDelete = await Presensi.findByPk(presensiId);
    if (!recordToDelete) {
      return res.status(404).json({ message: "Catatan presensi tidak ditemukan." });
    }

    if (recordToDelete.userId !== userId) {
      return res.status(403).json({
        message: "Akses ditolak: Anda bukan pemilik catatan ini.",
      });
    }

    await recordToDelete.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// ============================
// SEARCH BERDASARKAN NAMA
// ============================
exports.searchByName = async (req, res) => {
  try {
    const { nama } = req.query;
    const results = await Presensi.findAll({
      where: {
        nama: { [Op.like]: `%${nama}%` },
      },
    });
    res.json({ total: results.length, data: results });
  } catch (error) {
    res.status(500).json({ message: "Gagal mencari data", error: error.message });
  }
};

// ============================
// SEARCH BERDASARKAN TANGGAL
// ============================
exports.searchByDate = async (req, res) => {
  try {
    const { tanggalMulai, tanggalSelesai } = req.query;
    if (!tanggalMulai || !tanggalSelesai) {
      return res.status(400).json({ message: "Harap isi tanggalMulai dan tanggalSelesai" });
    }

    const results = await Presensi.findAll({
      where: {
        checkIn: {
          [Op.between]: [new Date(tanggalMulai), new Date(tanggalSelesai)],
        },
      },
    });

    res.json({
      total: results.length,
      range: { tanggalMulai, tanggalSelesai },
      data: results,
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal mencari data", error: error.message });
  }
};