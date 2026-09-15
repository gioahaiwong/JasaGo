const { db } = require("./database");
const bcrypt = require("bcryptjs");

class Tugas {
  static getAllUser(callback) {
    db.all(
      `SELECT name, email, role, created_at FROM users ORDER BY created_at DESC`,
      callback,
    );
  }

  static createUser(userData, callback) {
    const { name, email, role, password } = userData;

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    db.run(
      `INSERT INTO users(name, email, role, password_hash) VALUES (?, ?, ?, ?) `,
      [name, email, role, password_hash],
      function (err) {
        if (err) callback(err);
        else {
          db.get(
            `SELECT *, datetime(created_at, '+7 hours') as created_at_local FROM users where id = ?`,
            [this.lastID],
            callback,
          );
        }
      },
    );
  }

  static updateUser(id, name, email, role, callback) {
    db.run(
      `UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?`,
      [id, name, email, role],
      callback,
    );
  }

  static deleteUser(id, callback) {
    db.run(`DELETE FROM users where id = ?`, [id], callback);
  }

  static getByEmail(email, callback) {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], callback);
  }
  static setResetToken(email, token, expiry, callback) {
    db.run(
      `UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?`,
      [token, expiry, email],
      callback,
    );
  }

  static getByResetToken(token, callback) {
    db.get(
      `SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > datetime('now')`,
      [token],
      callback,
    );
  }

  static updatePassword(id, newPasswordHash, callback) {
    db.run(
      `UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?`,
      [newPasswordHash, id],
      callback,
    );
  }

  static changePassword(id, oldPassword, newPasswordHash, callback) {
    // Cek old password dulu
    db.get(`SELECT password_hash FROM users WHERE id = ?`, [id], (err, row) => {
      if (err) return callback(err);
      if (!row) return callback(new Error("User not found"));
      const valid = bcrypt.compareSync(oldPassword, row.password_hash);
      if (!valid) return callback(new Error("Old password is incorrect"));
      // Update password
      db.run(
        `UPDATE users SET password_hash = ? WHERE id = ?`,
        [newPasswordHash, id],
        callback,
      );
    });
  }
}

module.exports = Tugas;
