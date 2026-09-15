const express = require("express");
const router = express.Router();
const userController = require("./userController");
const auth = require("../backend/authentication/authentication");
const roleMiddleware = require("../backend/authentication/roleMiddleware");
router.post("/register", userController.createUser);
router.post("/login", userController.loginUser);
router.post("/logout", userController.logoutUser);
router.put("/:id", userController.updateUser);
// router.post("/forgot-password", userController.forgotPassword);
// router.post("/reset-password/:token", userController.resetPassword);
router.get("/me", auth, userController.getMe);
router.get(
  "/admin/users",
  auth,
  roleMiddleware("admin"),
  userController.getAllUser,
);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password/:token", userController.resetPassword);
router.put("/change-password", auth, userController.changePassword);
module.exports = router;
