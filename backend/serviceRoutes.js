const express = require("express");
const router = express.Router();
const serviceController = require("./serviceController");
const roleMidd = require("./authentication/roleMiddleware");
const auth = require("./authentication/authentication");

router.get("/", serviceController.getAllService);
router.get("/my-services", auth, serviceController.getMyServices);
router.get("/recommendations", auth, serviceController.recommendationServices);
router.get("/:id", serviceController.getServiceById);
router.post(
  "/register-service",
  auth,
  roleMidd("provider"),
  serviceController.createService,
);
router.put("/:id", auth, serviceController.updateServis);
router.delete("/:id", auth, serviceController.deleteService);

module.exports = router;
