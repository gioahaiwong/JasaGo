const express = require("express");
const router = express.Router();
const auth = require("./authentication/authentication");
const role = require("./authentication/roleMiddleware");
const reviewController = require("./reviewController");

router.post(
  "/make-review",
  auth,
  role("client"),
  reviewController.createReview,
);
router.get("/service/:serviceId", auth, reviewController.getReviewByService);
router.get(
  "/providers/reviews",
  auth,
  role("provider"),
  reviewController.getReviewSpecificProvider,
);

module.exports = router;
