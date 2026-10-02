const TugasServis = require("./serviceModel");
const axios = require("axios");
const getAllService = (req, res) => {
  TugasServis.getAllService((err, service) => {
    if (err) {
      console.error("Error in fetching the Data!", err);
      return res.status(500).json({ error: "Error in fetching the data!" });
    }
    res.json(service || []);
  });
};
// const searchServices = (req, res) => {
//   const { q, category, min_price, max_price, location } = req.query;

//   let query = `SELECT * FROM services WHERE is_active = 1`;
//   let params = [];

//   if (q) {
//     query += ` AND title LIKE ?`;
//     params.push(`%${q}%`);
//   }
//   if (category) {
//     query += ` AND category = ?`;
//     params.push(category);
//   }
//   if (min_price) {
//     query += ` AND price >= ?`;
//     params.push(min_price);
//   }
//   if (max_price) {
//     query += ` AND price <= ?`;
//     params.push(max_price);
//   }

//   db.all(query, params, (err, services) => {
//     if (err) return res.status(500).json({ message: "Database error" });
//     res.json(services);
//   });
// };

const searchServices = (req, res) => {
  const { q, category, min_price, max_price, location } = req.query;
  TugasServis.searchServices(
    { q, category, min_price, max_price, location },
    (err, services) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(services || []);
    },
  );
};
const createService = (req, res) => {
  const { title, price, category, location } = req.body;
  const provider_id = req.user.id;
  if (!price || !title) {
    return res.status(400).json({ message: "Title and Price Are Required!" });
  }
  TugasServis.createService(
    { provider_id, title, price, category, location },

    (err, service) => {
      if (err) {
        return res.status(500).json({ message: "Create failed!" });
      }
      res.status(201).json(service);
    },
  );
};

const deleteService = (req, res) => {
  const serviceId = req.params.id;
  const providerId = req.user.id;
  const userRole = req.user.role;

  TugasServis.getByIdService(serviceId, (err, service) => {
    if (err) {
      return res.status(500).json({ message: "Error in fetching the data!" });
    }
    if (!service) {
      return res.status(404).json({ message: "Service Not Found!" });
    }
    if (service.provider_id !== providerId && userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this service!" });
    }
    if (service.is_active === 0) {
      return res.status(400).json({ message: "Service already deleted!" });
    }

    // Panggil softdeleteService untuk menandai service sebagai tidak aktif
    TugasServis.softdeleteService(serviceId, (err) => {
      if (err) return res.status(500).json({ message: "Delete Failed!" });
      res.json({ message: "Service Successfully Deleted!" });
    });
  });
};

const updateServis = (req, res) => {
  const { id } = req.params;
  TugasServis.updateServis(id, req.body, (err) => {
    if (err) return res.status(500).json({ message: "Update Failed!" });
    res.json({ message: "Message Successfully Updated!" });
  });
};

const getServiceById = (req, res) => {
  const { id } = req.params;
  TugasServis.getByIdService(id, (err, service) => {
    if (err)
      return res.status(500).json({ message: "Id is not valid or error!" });
    if (!service)
      return res.status(404).json({ message: "Service is not provided yet!" });
    res.json(service);
  });
};
const getMyServices = (req, res) => {
  const provider_id = req.user.id;
  console.log("Provider_id in getMyServices : ", provider_id); // Debug dahulu
  TugasServis.getStatusProvider(provider_id, (err, services) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(services);
  });
};

const recommendationServices = (req, res) => {
  const client_id = req.user.id;
  TugasServis.getRecommendations(client_id, (err, recommendations) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database Error!" });
    }
    console.log("Recommendations fetched: ", recommendations);
    res.json(recommendations || []); // Kalau kosong, kembalikan array kosong sahaja
  });
};

const predictPrice = (req, res) => {
  const { category, location, title } = req.body;
  if (!category || !location) {
    return res
      .status(400)
      .json({ message: "Categoy and Location must be filled!" });
  }

  TugasServis.getTrainingData(async (err, rows) => {
    if (err) {
      console.error("❌ DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    try {
      const mlResponse = await axios.post(
        "http://localhost:5000/predict-price",
        {
          category,
          location,
          title: title || "",
          training_data: rows,
        },
        { timeout: 5000 },
      );

      res.json(mlResponse.data);
    } catch (mlErr) {
      console.error("Error in training!", mlErr.message);
      return res
        .status(500)
        .json({ message: "Prediction service unavailable" });
    }
  });
};
module.exports = {
  getAllService,
  createService,
  deleteService,
  getServiceById,
  updateServis,
  getMyServices,
  recommendationServices,
  searchServices,
  predictPrice,
};
