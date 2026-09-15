// const jwt = require("jsonwebtoken");

// const authenticator = (req, res, next) => {
//   // const authHeader = req.headers.authorization;
//   const token = req.cookies.token;
//   if (!token) {
//     return res.status(401).json({ message: "Unauthorized: No Token Provided" });
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     if (err.name === "TokenExpiredError") {
//       return res.status(401).json({ message: "Unauthorized: Token Expired" });
//     }
//     return res.status(401).json({ message: "Invalid token!" });
//   }
// };

// module.exports = authenticator;

const jwt = require("jsonwebtoken");

const authenticator = (req, res, next) => {
  const token = req.cookies.token;
  console.log(
    "🔐 [AUTH] Token from cookie:",
    token ? "✅ exists" : "❌ missing",
  );

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No Token Provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ [AUTH] Decoded payload:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("❌ [AUTH] Error:", err.message);
    return res.status(401).json({ message: "Invalid token!" });
  }
};

module.exports = authenticator;
