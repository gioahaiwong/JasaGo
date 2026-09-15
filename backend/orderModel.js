const { db } = require("./database");
const { invalidate } = require("./cache");

class Pesanan {
  static createOrder(putData, callback) {
    const {
      service_id,
      client_id,
      provider_id,
      requested_date,
      client_address,
    } = putData;
    db.run(
      `INSERT INTO orders(service_id, client_id, provider_id, requested_date, client_address) VALUES (?, ?, ?, ?, ?)`,
      [service_id, client_id, provider_id, requested_date, client_address],
      function (err) {
        if (err) callback(err);
        else {
          invalidate(`recommendations_${client_id}`);
          db.get(
            `SELECT o.*,
                u1.name AS client_name,
                u2.name AS provider_name,
                s.title AS service_title,
                s.price
         FROM orders o
         JOIN users u1 ON u1.id = o.client_id
         JOIN users u2 ON u2.id = o.provider_id
         JOIN services s ON s.id = o.service_id
         WHERE o.id = ?`,
            [this.lastID],
            callback,
          );
        }
      },
    );
  }
  static getByIdOrder(id, callback) {
    db.get(
      `SELECT o.*,
            u1.name AS client_name,
            u2.name AS provider_name,
            s.title AS service_title,
            s.price
     FROM orders o
     JOIN users u1 ON u1.id = o.client_id
     JOIN users u2 ON u2.id = o.provider_id
     JOIN services s ON s.id = o.service_id
     WHERE o.id = ?`,
      [id],
      callback,
    );
  }

  static cancel(id, callback) {
    db.run(
      `UPDATE orders SET status = "cancelled" WHERE id = ?`,
      [id],
      callback,
    );
  }
  static getByProvider(provider_id, callback) {
    db.all(
      `SELECT o.*,
            u1.name AS client_name,
            u2.name AS provider_name,
            s.title AS service_title,
            s.price
     FROM orders o
     JOIN users u1 ON u1.id = o.client_id
     JOIN users u2 ON u2.id = o.provider_id
     JOIN services s ON s.id = o.service_id
     WHERE o.provider_id = ?
     ORDER BY o.created_at DESC`,
      [provider_id],
      callback,
    );
  }
  static setStatus(id, status, callback) {
    db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, id], callback);
  }
  static getByClient(client_id, callback) {
    db.all(
      `SELECT o.*, 
            s.title AS service_title, 
            s.price, 
            s.category,
            u2.name AS provider_name
     FROM orders o
     JOIN services s ON o.service_id = s.id
     JOIN users u2 ON u2.id = o.provider_id
     WHERE o.client_id = ?
     ORDER BY o.created_at DESC`,
      [client_id],
      callback,
    );
  }
  static getAllOrders(callback) {
    db.all(
      `SELECT o.*,
            u1.name AS client_name,
            u2.name AS provider_name,
            s.title AS service_title,
            s.price
     FROM orders o
     JOIN users u1 ON u1.id = o.client_id
     JOIN users u2 ON u2.id = o.provider_id
     JOIN services s ON s.id = o.service_id
     ORDER BY o.created_at DESC`,
      callback,
    );
  }
}

module.exports = Pesanan;
