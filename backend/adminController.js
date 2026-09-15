const { db } = require("./database");

const getStats = (req, res) => {
  Promise.all([
    new Promise((selesai, tolak) => {
      db.get("SELECT COUNT(*) as total FROM users", (err, row) => {
        if (err) tolak(err);
        else selesai(row.total);
      });
    }),
    new Promise((selesai, tolak) => {
      db.get(
        "SELECT COUNT(*) as total FROM services WHERE is_active = 1",
        (err, row) => {
          if (err) tolak(err);
          else selesai(row.total);
        },
      );
    }),
    new Promise((selesai, tolak) => {
      db.get("SELECT COUNT(*) as total FROM orders", (err, row) => {
        if (err) tolak(err);
        else selesai(row.total);
      });
    }),
    new Promise((selesai, tolak) => {
      db.get(
        "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'paid'",
        (err, row) => {
          if (err) tolak(err);
          else selesai(row.total);
        },
      );
    }),
  ])
    .then(([totalUsers, totalServices, totalOrders, totalRevenue]) => {
      res.json({ totalUsers, totalServices, totalOrders, totalRevenue });
    })
    .catch((err) => {
      console.error("Error fetching stats:", err);
      res.status(500).json({ message: "Failed to load stats!" });
    });
};

const rejectPayments = (req, res) => {
  const payment_id = req.params.payment_id;

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin ONLY!!!" });
  }

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    db.run(
      `UPDATE payments SET status = 'rejected' WHERE id = ?`,
      [payment_id],
      function (err) {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({ message: "Failed to reject payment!" });
        }

        db.get(
          `SELECT order_id FROM payments WHERE id = ?`,
          [payment_id],
          (err, row) => {
            if (err || !row) {
              //ini artinya kalau ada error atau rownya itu null alias kata lain tidak ada data ditemukan, maka wajib lakukan rollback
              db.run("ROLLBACK");
              return res.status(500).json({ message: "Order not found!" });
            }

            db.run(
              `UPDATE orders SET status = 'cancelled' WHERE id = ?`,
              [row.order_id],
              function (err) {
                if (err) {
                  db.run("ROLLBACK");
                  return res
                    .status(500)
                    .json({ message: "Failed to update order!" });
                }

                db.run("COMMIT", (err) => {
                  if (err) {
                    return res.status(500).json({ message: "Commit failed!" });
                  }
                  res.json({
                    message: "Payment rejected and order cancelled.",
                  });
                });
              },
            );
          },
        );
      },
    );
  });
};

module.exports = { getStats, rejectPayments };
