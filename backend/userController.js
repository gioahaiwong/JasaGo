const Tugas = require("./userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const getAllUser = (req, res) => {
  Tugas.getAllUser((err, users) => {
    if (err) {
      console.error("Error in Fetching The Data!", err);
      return res.status(500).json({ error: "Error in fetching data !" });
    }
    res.json(users);
  });
};

const createUser = (req, res) => {
  const { name, email, role, password } = req.body;
  if (!email.includes("@") || !email.includes(".") || email.length < 5) {
    return res.status(400).json({ message: "Invalid Email Format!" });
  }
  if (!password || password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password Must Be At Least 6 Characters!" });
  }
  if (!["client", "provider"].includes(role)) {
    return res
      .status(400)
      .json({ message: "Role must be either 'client' or 'provider" });
  }

  Tugas.createUser(
    {
      name,
      email,
      role,
      password,
    },
    (err, user) => {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(409).json({ message: "Email Already Exists!" });
        }
        return res.status(500).json({ message: "Database Error!" });
      }
      res.status(201).json({ message: "User Registered Successfully !" });
    },
  );
};

const loginUser = (req, res) => {
  const { email, password } = req.body;
  Tugas.getByEmail(email, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: "Incorrect Password or Email !" });
    }
    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ message: "Incorrect Password or Email !" });
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.cookie("token", token, {
      httpOnly: true, // Tidak bisa diakses JavaScript (AMAN dari XSS)
      secure: process.env.NODE_ENV === "production", // true jika pakai HTTPS
      sameSite: "lax", // Perlindungan CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    });
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });
};
const logoutUser = (req, res) => {
  // Hapus cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

const updateUser = (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  if (!name && !email && !role) {
    return res.status(400).json({ message: "At Least One Field Updated!" });
  }
  Tugas.updateUser(id, req.body, (err) => {
    if (err) return res.status(500).json({ message: "Update failed!" });
    res.json({ message: "Successfully Update User !" });
  });
};
const getMe = (req, res) => {
  // req.user sudah diisi oleh middleware authenticator (dari cookie)
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
};
// // 1. Forgot Password - Kirim reset token (via console untuk demo)
// const forgotPassword = (req, res) => {
//   const { email } = req.body;
//   if (!email) return res.status(400).json({ message: "Email is required" });

//   Tugas.getByEmail(email, (err, user) => {
//     if (err || !user) {
//       // Jangan kasih tahu email tidak ditemukan (keamanan)
//       return res.json({
//         message: "If this email exists, a reset link has been sent.",
//       });
//     }

//     // Generate token
//     const token = crypto.randomBytes(32).toString("hex");
//     const expiry = new Date(Date.now() + 3600000).toISOString(); // 1 jam

//     Tugas.setResetToken(email, token, expiry, (err) => {
//       if (err) {
//         console.error(err);
//         return res
//           .status(500)
//           .json({ message: "Failed to generate reset link" });
//       }

//       // Di sini Anda bisa kirim email dengan Nodemailer
//       // Untuk demo, kita log token ke console
//       console.log(`🔑 Reset token for ${email}: ${token}`);
//       console.log(`🔗 Use: POST /api/users/reset-password/${token}`);

//       res.json({
//         message: "Reset link has been sent to your email.",
//         // Hanya untuk development:
//         token: process.env.NODE_ENV === "development" ? token : undefined,
//       });
//     });
//   });
// };
const forgotPassword = (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  Tugas.getByEmail(email, (err, user) => {
    if (err || !user) {
      return res.json({
        message: "If this email exists, a reset link has been sent.",
      });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000).toISOString();

    Tugas.setResetToken(email, token, expiry, (err) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ message: "Failed to generate reset link" });
      }

      // ✅ TAMPILKAN TOKEN DI CONSOLE (untuk testing)
      console.log(`🔑 Reset token for ${email}: ${token}`);
      console.log(`🔗 Use: http://localhost:5173/password-reset/${token}`);

      // ✅ KIRIM TOKEN KE RESPONSE (hanya untuk development)
      res.json({
        message: "Reset link has been sent to your email.",
        token: token, // ⚠️ Hanya untuk development! Hapus di production.
        resetUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/password-reset/${token}`,
      });
    });
  });
};

// 2. Reset Password - Verifikasi token & update password
const resetPassword = (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  Tugas.getByResetToken(token, (err, user) => {
    if (err || !user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    const password_hash = bcrypt.hashSync(newPassword, 10);
    Tugas.updatePassword(user.id, password_hash, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to reset password" });
      }
      res.json({ message: "Password has been reset successfully!" });
    });
  });
};

// 3. Change Password - User sudah login
const changePassword = (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Old and new password are required" });
  }
  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "New password must be at least 6 characters" });
  }

  const newPasswordHash = bcrypt.hashSync(newPassword, 10);
  Tugas.changePassword(userId, oldPassword, newPasswordHash, (err) => {
    if (err) {
      if (err.message === "Old password is incorrect") {
        return res.status(400).json({ message: err.message });
      }
      console.error(err);
      return res.status(500).json({ message: "Failed to change password" });
    }
    res.json({ message: "Password changed successfully!" });
  });
};
module.exports = {
  createUser,
  loginUser,
  getAllUser,
  updateUser,
  logoutUser,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
};
