const express = require("express");
const router = express.Router();
const auth = require("./authentication/authentication");
const orderController = require("./orderController");
const roleMiddleware = require("./authentication/roleMiddleware");

router.post("/make-order", auth, orderController.createOrder);
router.get("/my-orders", auth, orderController.getByClient);
router.get("/:id", auth, orderController.getOrderById);
router.put("/:id/status", auth, orderController.updateStatus);
router.put("/:id/cancel", auth, orderController.cancel);
router.get("/provider/orders", auth, orderController.getByProvider);
router.get("/client/orders", auth, orderController.getByClient);
router.get(
  "/admin/orders",
  auth,
  roleMiddleware("admin"),
  orderController.getAllOrders,
);
module.exports = router;
