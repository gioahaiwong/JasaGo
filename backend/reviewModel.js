const { db } = require("./database");
const { invalidate } = require("./cache");

class Review {
  static getReviewByOrder(orders_id, callback) {
    db.get(`SELECT * FROM review WHERE orders_id = ?`, [orders_id], callback);
  }

  static reviewForService(service_id, callback) {
    db.all(
      `SELECT r.rating, r.comment, r.created_at FROM review r JOIN orders o ON o.id = r.orders_id WHERE o.service_id = ?`,
      [service_id],
      callback,
    );
  }

  static getReviewSpecificProvider(provider_id, callback) {
    db.all(
      `SELECT r.id, r.rating, r.comment, r.created_at,
            u.name AS client_name,
            s.title AS service_title,
            s.id AS service_id,
            o.id AS order_id
     FROM review r
     JOIN orders o ON o.id = r.orders_id
     JOIN services s ON s.id = o.service_id
     JOIN users u ON u.id = o.client_id
     WHERE s.provider_id = ?
     ORDER BY r.created_at DESC`,
      [provider_id],
      callback,
    );
  }
  // reviewModel.js

  static createReview(orders_id, rating, comment, callback) {
    // Ambil client_id dari order dulu
    db.get(
      `SELECT client_id FROM orders WHERE id = ?`,
      [orders_id],
      (err, row) => {
        if (err) return callback(err);
        db.run(
          `INSERT INTO review(orders_id, rating, comment) VALUES (?, ?, ?)`,
          [orders_id, rating, comment],
          function (err) {
            if (err) return callback(err);
            if (row) invalidate(`recommendations_${row.client_id}`);
            db.get(
              `SELECT * FROM review WHERE id = ?`,
              [this.lastID],
              callback,
            );
          },
        );
      },
    );
  }
}

module.exports = Review;
