const TugasReview = require("./reviewModel");
const TugasOrder = require("./orderModel");
const createReview = (req, res) => {
  const { orders_id, rating, comment } = req.body;
  if (!orders_id || !rating)
    return res
      .status(400)
      .json({ message: "orders_id and rating are required!" });
  if (rating < 1 || rating > 5)
    return res.status(400).json({ message: "Rating must be between 1 - 5" });

  TugasOrder.getByIdOrder(orders_id, (err, orders) => {
    if (err) return res.status(500).json({ message: "Database Error" });
    if (!orders) return res.status(404).json({ message: "Order Not Found!" });
    if (orders.status !== "completed") {
      return res.status(400).json({ message: "Order Not Completed Yet" });
    }
    TugasReview.getReviewByOrder(orders_id, (err, review) => {
      if (err) return res.status(500).json({ message: "Database Error!" });
      if (review) return res.status(409).json({ message: "Reviewed Already!" });
      TugasReview.createReview(orders_id, rating, comment, (err, review) => {
        if (err)
          return res.status(500).json({ message: "Create Review Error" });
        res.status(201).json(review);
      });
    });
  });
};

const getReviewByService = (req, res) => {
  TugasReview.reviewForService(req.params.id, (err, review) => {
    if (err) return res.status(500).json({ message: "Database Error!" });
    res.json(review || []);
  });
};

const getReviewSpecificProvider = (req, res) => {
  const provider_id = req.user.id;
  if (!provider_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  TugasReview.getReviewSpecificProvider(provider_id, (err, reviews) => {
    if (err) {
      console.error("Error Fetching the data of Review !", err);
      return res.status(500).json({ message: "Database Error!" });
    }
    res.json(reviews || []);
  });
};

module.exports = {
  createReview,
  getReviewByService,
  getReviewSpecificProvider,
};
