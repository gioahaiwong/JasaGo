const TugasOrder = require("./orderModel");

const createOrder = (req, res) => {
  const { service_id, provider_id, requested_date, client_address } = req.body;
  const client_id = req.user.id;
  if (!service_id || !provider_id)
    return res
      .status(400)
      .json({ message: "Service ID and Provider ID are required!" });
  TugasOrder.createOrder(
    { service_id, client_id, provider_id, requested_date, client_address },
    (err, orders) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database Error" });
      }
      res.json(orders);
    },
  );
};

const getOrderById = (req, res) => {
  TugasOrder.getByIdOrder(req.params.id, (err, orders) => {
    if (err) return res.status(500).json({ message: "Database Error" });
    if (!orders) return res.status(404).json({ message: "Order Not Found!" });
    res.json(orders);
  });
};

const getByClient = (req, res) => {
  const client_id = req.user.id;
  TugasOrder.getByClient(client_id, (err, orders) => {
    if (err) return res.status(500).json({ message: "Database Error!" });
    res.json(orders || []);
  });
};
const getByProvider = (req, res) => {
  const provider_id = req.user.id;
  TugasOrder.getByProvider(provider_id, (err, orders) => {
    if (err) return res.status(500).json({ message: "Database Error!" });

    res.json(orders || []);
  });
};

const cancel = (req, res) => {
  TugasOrder.getByIdOrder(req.params.id, (err, order) => {
    if (!order) return res.status(404).json({ message: "Order Not Found" });
    if (err) return res.status(500).json({ message: "Fetching Order Error!" });
    if (req.user.role === "client" && order.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Cannot cancel order if already accepted!" });
    }
    TugasOrder.cancel(req.params.id, (err) => {
      if (err) return res.status(500).json({ message: "Failed to delete!" });
      res.json({ message: "Successfully Cancel Order!" });
    });
  });
};

const updateStatus = (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ message: "Status is required!" });
  TugasOrder.setStatus(req.params.id, status, (err) => {
    if (err) return res.status(500).json({ message: "Database Error!" });
    res.json({ message: "Status has been updated!" });
  });
};
const getAllOrders = (req, res) => {
  TugasOrder.getAllOrders((err, orders) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database Error!" });
    }
    res.json(orders || []);
  });
};

module.exports = {
  createOrder,
  getOrderById,
  getByProvider,
  cancel,
  updateStatus,
  getAllOrders,
  getByClient,
};
