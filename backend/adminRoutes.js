const express = require("express");
const router = express.Router();
const auth = require("./authentication/authentication");
const roleMiddleware = require("./authentication/roleMiddleware");
const adminController = require("./adminController");

// Dashboard stats
router.get("/stats", auth, roleMiddleware("admin"), adminController.getStats);

// (Tambahan) Jika nanti mau lihat daftar semua user, dll.
// router.get("/users", auth, roleMiddleware("admin"), adminController.getAllUsers);

module.exports = router;
