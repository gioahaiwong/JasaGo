const { db } = require("./database");
const { getOrSet, invalidate } = require("./cache");

class servis {
  static getAllService(callback) {
    const fetchServices = () => {
      return new Promise((resolve, reject) => {
        //Pakai promise karena kita ingin menunggu hasil dari query database sebelum mengembalikan data ke callback. Promise memungkinkan kita untuk menangani operasi asynchronous dengan lebih baik.
        db.all(
          `SELECT s.id, s.title, s.price, s.category, UPPER(s.location), s.is_active, s.created_at, u.name AS provider_name FROM
          services s
          JOIN users u ON u.id = s.provider_id WHERE s.is_active = 1 ORDER BY s.created_at DESC`,
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          },
        );
      });
    };
    getOrSet("allServices", fetchServices, 10)
      .then((data) => callback(null, data)) //Ini artinya kalau berhasil, maka data akan dikembalikan ke callback dengan parameter pertama null (tidak ada error) dan parameter kedua adalah data yang diambil dari cache atau database.
      .catch((err) => callback(err));
  }

  static getByIdService(id, callback) {
    const cacheKey = `service_${id}`;
    const fetchServiceById = () => {
      return new Promise((resolve, reject) => {
        db.get(
          `SELECT s.*, u.name AS provider_name
     FROM services s
     JOIN users u ON u.id = s.provider_id
     WHERE s.id = ?`,
          [id],
          function (err, row) {
            if (err) reject(err);
            else if (!row) reject(new Error("Service Not Found!"));
            else resolve(row);
          },
        );
      });
    };
    getOrSet(cacheKey, fetchServiceById, 10)
      .then((data) => callback(null, data))
      .catch((err) => callback(err));
  }

  static createService(dataservice, callback) {
    const { provider_id, title, price, category, location } = dataservice;
    db.run(
      `INSERT INTO services (provider_id, title, price, category, location)
        VALUES (?, ?, ?, ?, ?)`,
      [provider_id, title, price, category, location],
      function (err) {
        if (err) return callback(err);
        invalidate("allServices"); // Menghapus cache untuk semua layanan karena ada layanan baru yang ditambahkan
        invalidate(`services_provider_${provider_id}`);
        db.get(
          `SELECT *, datetime(created_at, '+7 hours') as created_at_local FROM services where id = ?`,
          [this.lastID],
          callback,
        );
      },
    );
  }

  static updateServis(id, dataUbah, callback) {
    // Ambil provider_id dulu untuk invalidasi cache
    db.get(
      `SELECT provider_id FROM services WHERE id = ?`,
      [id],
      (err, row) => {
        if (err) return callback(err);
        const { title, price, category, location } = dataUbah;
        db.run(
          `UPDATE services SET title = ?, price = ?, category = ?, location = ? WHERE id = ?`,
          [title, price, category, location, id],
          function (err) {
            if (err) return callback(err);
            invalidate("allServices");
            invalidate(`service_${id}`);
            if (row) invalidate(`services_provider_${row.provider_id}`);
            callback(null, { message: "Service updated successfully" });
          },
        );
      },
    );
  }

  static getStatusProvider(provider_id, callback) {
    const cacheKey = `services_provider_${provider_id}`;
    const ambilServis = () => {
      return new Promise((resolve, reject) => {
        db.all(
          `SELECT * FROM services WHERE provider_id = ? AND is_active = 1 ORDER BY created_at DESC`,
          [provider_id],
          function (err, row) {
            if (err) {
              reject(err);
            } else if (!row) {
              reject(new Error("No active services found for this provider!"));
            } else {
              resolve(row);
            }
          },
        );
      });
    };
    getOrSet(cacheKey, ambilServis, 300)
      .then((data) => callback(null, data))
      .catch((err) => callback(err));
  }

  static softdeleteService(id, callback) {
    // Ambil provider_id dulu untuk invalidasi
    db.get(
      `SELECT provider_id FROM services WHERE id = ?`,
      [id],
      (err, row) => {
        if (err) return callback(err);
        db.run(
          `UPDATE services SET is_active = 0 WHERE id = ?`,
          [id],
          function (err) {
            if (err) return callback(err);
            invalidate("allServices"); // ← konsisten
            invalidate(`service_${id}`);
            if (row) invalidate(`services_provider_${row.provider_id}`); // ← tambah
            callback(null);
          },
        );
      },
    );
  }
  static getTrainingData(callback) {
    db.all(
      `SELECT category, location, title, price 
     FROM services 
     WHERE is_active = 1`,
      callback,
    );
  }

  static getRecommendations(client_id, callback) {
    const fetchRecommendations = () => {
      return new Promise((resolve, reject) => {
        // Fungsi fallback: ambil service terpopuler (urut created_at terbaru), COALESCE(AVG(r.rating), 0) as avg_rating artinya kalau tidak ada review, rata-rata rating dianggap 0
        const fallbackPopular = () => {
          db.all(
            `SELECT s.id, s.title, s.price, s.category, s.location, s.is_active,
                  u.name as provider_name,
                  COALESCE(AVG(r.rating), 0) as avg_rating 
           FROM services s
           JOIN users u ON u.id = s.provider_id
           LEFT JOIN orders o ON o.service_id = s.id
           LEFT JOIN review r ON r.orders_id = o.id
           WHERE s.is_active = 1
           GROUP BY s.id
           ORDER BY s.created_at DESC
           LIMIT 3`,
            (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
            },
          );
        };

        // Query 1: Cari kategori favorit user
        db.get(
          `SELECT s.category, COUNT(*) as total 
         FROM orders o 
         JOIN services s ON o.service_id = s.id 
         WHERE o.client_id = ? AND o.status IN ('completed', 'accepted') 
         GROUP BY s.category 
         ORDER BY total DESC 
         LIMIT 1`,
          [client_id],
          (err, row) => {
            // Jika error atau user belum pernah order → fallback
            if (err || !row) {
              return fallbackPopular();
            }

            // Query 2: Cari service kategori favorit yang belum di-order
            db.all(
              `SELECT s.id, s.title, s.price, s.category, s.location, s.is_active,
                    u.name as provider_name,
                    COALESCE(AVG(r.rating), 0) as avg_rating 
             FROM services s
             JOIN users u ON u.id = s.provider_id
             LEFT JOIN orders o ON o.service_id = s.id
             LEFT JOIN review r ON r.orders_id = o.id
             WHERE s.category = ? 
               AND s.is_active = 1
               AND s.id NOT IN (
                 SELECT service_id FROM orders WHERE client_id = ?
               )
             GROUP BY s.id
             ORDER BY avg_rating DESC, s.created_at DESC
             LIMIT 6`,
              [row.category, client_id],
              (err2, rows) => {
                if (err2) return reject(err2);
                // Jika hasil kosong, fallback ke service populer
                if (!rows || rows.length === 0) {
                  return fallbackPopular();
                }
                resolve(rows);
              },
            );
          },
        );
      });
    };

    getOrSet(`recommendations_${client_id}`, fetchRecommendations, 600)
      .then((data) => callback(null, data))
      .catch((err) => callback(err));
  }
}

module.exports = servis;
