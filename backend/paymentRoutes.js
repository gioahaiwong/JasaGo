// paymentRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("./authentication/authentication");
const roleMiddleware = require("./authentication/roleMiddleware");
const paymentController = require("./paymentController");
const adminController = require("./adminController");
const uploadController = require("./uploadController");
// Client routes
router.post("/create", auth, paymentController.createPayment);
router.post("/upload-proof", auth, paymentController.uploadProof);
router.get("/order/:order_id", auth, paymentController.getPaymentByOrder);
router.put(
  "/reject/:payment_id",
  auth,
  roleMiddleware("admin"),
  adminController.rejectPayments,
);
router.post("/upload-file", auth, uploadController.uploadFile);
router.get(
  "/pending",
  auth,
  roleMiddleware("admin"),
  paymentController.getPendingPayments,
);
router.put(
  "/verify/:payment_id",
  auth,
  roleMiddleware("admin"),
  paymentController.verifyPayment,
);
module.exports = router;
