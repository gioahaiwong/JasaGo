const roleMiddleware = (allowedRoles) => {
  // Ubah ke array jika yang dikirim adalah string
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    // Cek apakah user sudah ada di req.user (dari middleware auth)
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden! Need role: " + roles.join(" or ") });
    }
    next();
  };
};

module.exports = roleMiddleware;
