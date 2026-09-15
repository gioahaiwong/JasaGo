// paymentModel.js
const { db } = require("./database");

class Payment {
  // Buat payment record baru
  static createPayment(paymentData, callback) {
    const { order_id, amount, payment_method, notes } = paymentData;

    db.run(
      `
      INSERT INTO payments (order_id, amount, payment_method, notes, status)
      VALUES (?, ?, ?, ?, 'pending')
    `,
      [order_id, amount, payment_method, notes],
      function (err) {
        if (err) return callback(err);

        // Update payment_status di tabel orders
        db.run(
          `
        UPDATE orders SET payment_status = 'pending' WHERE id = ?
      `,
          [order_id],
          (err2) => {
            if (err2) return callback(err2);

            db.get(
              `SELECT * FROM payments WHERE id = ?`,
              [this.lastID],
              callback,
            );
          },
        );
      },
    );
  }

  // Client upload bukti pembayaran
  static uploadProof(payment_id, proof_url, callback) {
    db.run(
      `
      UPDATE payments
      SET proof_url = ?,
          status = 'waiting_confirmation',
          paid_at = datetime('now')
      WHERE id = ?
    `,
      [proof_url, payment_id],
      callback,
    );
  }

  // Admin/Provider verifikasi pembayaran
  static verifyPayment(payment_id, verified_by, callback) {
    db.run(
      `
      UPDATE payments
      SET status = 'paid',
          verified_by = ?,
          verified_at = datetime('now')
      WHERE id = ?
    `,
      [verified_by, payment_id],
      function (err) {
        if (err) return callback(err);

        // Update status order
        db.run(
          `
        UPDATE orders
        SET payment_status = 'paid'
        WHERE id = (SELECT order_id FROM payments WHERE id = ?)
      `,
          [payment_id],
          callback,
        );
      },
    );
  }

  // Get payment by order ID
  static getByOrderId(order_id, callback) {
    db.get(
      `
      SELECT p.*, u.name as verified_by_name
      FROM payments p
      LEFT JOIN users u ON u.id = p.verified_by
      WHERE p.order_id = ?
    `,
      [order_id],
      callback,
    );
  }

  // Get payment by ID
  static getById(payment_id, callback) {
    db.get(`SELECT * FROM payments WHERE id = ?`, [payment_id], callback);
  }

  // Get all pending payments (untuk admin)
  static getPendingPayments(callback) {
    db.all(
      `
      SELECT p.*, o.service_id, o.client_id
      FROM payments p
      JOIN orders o ON o.id = p.order_id
      WHERE p.status IN ('pending', 'waiting_confirmation')
      ORDER BY p.created_at DESC
    `,
      callback,
    );
  }
}

module.exports = Payment;
