// paymentController.js
const Payment = require("./paymentModel");
const Order = require("./orderModel");

// Client: Buat payment record (setelah order dibuat)
const createPayment = (req, res) => {
  const { order_id, amount, payment_method, notes } = req.body;
  const client_id = req.user.id;

  // Validasi
  if (!order_id || !amount) {
    return res.status(400).json({ message: "Order ID dan amount required!" });
  }

  // Cek apakah order milik client ini
  Order.getByIdOrder(order_id, (err, order) => {
    if (err || !order) {
      return res.status(404).json({ message: "Order tidak ditemukan!" });
    }

    if (order.client_id !== client_id) {
      return res.status(403).json({ message: "Bukan order kamu!" });
    }

    // Cek apakah sudah ada payment untuk order ini
    Payment.getByOrderId(order_id, (err, existingPayment) => {
      if (existingPayment) {
        return res
          .status(400)
          .json({ message: "Payment sudah dibuat untuk order ini!" });
      }

      Payment.createPayment(
        { order_id, amount, payment_method, notes },
        (err, payment) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Gagal membuat payment!" });
          }

          res.status(201).json({
            message:
              "Silakan transfer ke rekening: BCA 1234567890 a.n. Marketplace",
            payment: payment,
          });
        },
      );
    });
  });
};

// Client: Upload bukti pembayaran
const uploadProof = (req, res) => {
  const { payment_id, proof_url } = req.body;

  if (!payment_id || !proof_url) {
    return res
      .status(400)
      .json({ message: "Payment ID dan proof_url required!" });
  }

  Payment.uploadProof(payment_id, proof_url, (err) => {
    if (err) return res.status(500).json({ message: "Gagal upload bukti!" });

    res.json({
      message: "Bukti pembayaran terkirim! Menunggu verifikasi admin.",
      status: "waiting_confirmation",
    });
  });
};

// Admin/Provider: Verifikasi pembayaran
const verifyPayment = (req, res) => {
  const { payment_id } = req.params;
  const admin_id = req.user.id;

  // Cek apakah user adalah admin atau provider terkait
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Hanya admin yang bisa verifikasi!" });
  }

  Payment.verifyPayment(payment_id, admin_id, (err) => {
    if (err) return res.status(500).json({ message: "Gagal verifikasi!" });

    res.json({ message: "Pembayaran diverifikasi! Order sekarang diproses." });
  });
};

// Lihat detail payment by order
const getPaymentByOrder = (req, res) => {
  const { order_id } = req.params;
  const user_id = req.user.id;
  const user_role = req.user.role;

  Payment.getByOrderId(order_id, (err, payment) => {
    if (err) return res.status(500).json({ message: "Database error!" });
    if (!payment)
      return res.status(404).json({ message: "Payment tidak ditemukan!" });

    // Cek akses: hanya client pemilik order, provider, atau admin
    Order.getByIdOrder(order_id, (err, order) => {
      if (err) return res.status(500).json({ message: "Error cek order!" });

      if (
        user_role !== "admin" &&
        order.client_id !== user_id &&
        order.provider_id !== user_id
      ) {
        return res.status(403).json({ message: "Tidak punya akses!" });
      }

      res.json(payment);
    });
  });
};

// Admin: Lihat semua pending payments
const getPendingPayments = (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Hanya untuk admin!" });
  }

  Payment.getPendingPayments((err, payments) => {
    if (err) return res.status(500).json({ message: "Database error!" });
    res.json(payments || []);
  });
};

module.exports = {
  createPayment,
  uploadProof,
  verifyPayment,
  getPaymentByOrder,
  getPendingPayments,
};
