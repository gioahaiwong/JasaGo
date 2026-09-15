const sqlite = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "jasago.db");

// Koneksi ke databasenya langsung
const db = new sqlite.Database(dbPath);

const dalamDatabase = () => {
  // Gunakan db.serialize() untuk menjalankan query berurutan
  db.serialize(() => {
    // 1. Tabel users
    db.run(
      `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT CHECK(role IN ('client', 'provider', 'admin')) NOT NULL,
        created_at DATETIME DEFAULT (datetime('now'))
      )
    `,
      (err) => {
        if (err) console.log("❌ Error users:", err.message);
        else console.log("✅ Tabel users siap");
      },
    );

    // 2. Tabel services
    db.run(
      `
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        provider_id INTEGER NOT NULL,
        title TEXT,
        price REAL NOT NULL,
        category TEXT,
        location TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT (datetime('now')),
        FOREIGN KEY (provider_id) REFERENCES users(id)
      )
    `,
      (err) => {
        if (err) console.log("❌ Error services:", err.message);
        else console.log("✅ Tabel services siap");
      },
    );

    // 3. Tabel orders (dengan client_id langsung dari awal)
    db.run(
      `
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL,  -- ← wajib ada!
    provider_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    
    payment_status TEXT DEFAULT 'unpaid',
    requested_date DATE,
    created_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (client_id) REFERENCES users(id),
    FOREIGN KEY (provider_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    CHECK(status IN ('pending', 'accepted', 'completed', 'cancelled'))
  )
`,
      (err) => {
        if (err) console.log("❌ Error orders:", err.message);
        else console.log("✅ Tabel orders siap");
      },
    );

    // 4. Tabel review
    db.run(
      `
      CREATE TABLE IF NOT EXISTS review (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orders_id INTEGER UNIQUE NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at DATETIME DEFAULT (datetime('now')),
        FOREIGN KEY (orders_id) REFERENCES orders(id),
        CHECK(rating >= 1 AND rating <= 5)
      )
    `,
      (err) => {
        if (err) console.log("❌ Error review:", err.message);
        else console.log("✅ Tabel review siap");
      },
    );

    // 5. Insert admin user (dengan password yang sudah di-hash)
    const bcrypt = require("bcryptjs");
    const hashedPassword = bcrypt.hashSync("admin123", 10);

    db.run(
      `
      INSERT OR IGNORE INTO users (name, email, password_hash, role) 
      VALUES ('Admin', 'adminwong@gmail.com', ?, 'admin')
    `,
      [hashedPassword],
      (err) => {
        if (err) console.log("❌ Error insert admin:", err.message);
        else console.log("✅ Admin user siap (email: adminwong@gmail.com)");
      },
    );
    // Di dalam fungsi dalamDatabase(), tambahkan tabel ini:

    db.run(
      `
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT DEFAULT 'bank_transfer',
    status TEXT DEFAULT 'pending',
    proof_url TEXT,
    notes TEXT,
    verified_by INTEGER,
    paid_at DATETIME,
    verified_at DATETIME,
    created_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (verified_by) REFERENCES users(id),
    CHECK(status IN ('pending', 'waiting_confirmation', 'paid', 'failed', 'refunded'))
  )
`,
      (err) => {
        if (err) console.log("❌ Error payments:", err.message);
        else console.log("✅ Tabel payments siap");
      },
    );
    db.run(
      `
  ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'unpaid'

`,
      (err) => {
        if (err && !err.message.includes("duplicate column")) {
          console.log("⚠️ Kolom payment_status mungkin sudah ada");
        } else {
          console.log("✅ Kolom payment_status ditambahkan");
        }
      },
    );
    db.run(`ALTER TABLE orders ADD COLUMN client_address TEXT`, (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.log("⚠️ Kolom client_address mungkin sudah ada");
      } else {
        console.log("✅ Kolom client_address ditambahkan");
      }
    });
    db.run(`ALTER TABLE users ADD COLUMN reset_token TEXT`, (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.log("⚠️ Kolom reset_token mungkin sudah ada");
      } else {
        console.log("✅ Kolom reset_token ditambahkan");
      }
    });
    db.run(
      `ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME`,
      (err) => {
        if (err && !err.message.includes("duplicate column")) {
          console.log("⚠️ Kolom reset_token_expiry mungkin sudah ada");
        } else {
          console.log("✅ Kolom reset_token_expiry ditambahkan");
        }
      },
    );
  });
};

dalamDatabase();
module.exports = { db, dalamDatabase };
