const express = require("express");
const bcrypt = require("bcrypt");
const { dbPromise } = require("../config/db");
const {
  verifyToken,
  generateToken,
  generateRefreshToken,
} = require("./tokenUtils");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    const [user] = await dbPromise.query(
      "SELECT id, username, email, password, role FROM users WHERE email = ?",
      [email]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const match = await bcrypt.compare(password, user[0].password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const accessToken = generateToken(user[0]);
    const refreshToken = generateRefreshToken(user[0]);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.status(200).json({ token: accessToken });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed." });
  }
});

router.post("/refresh-token", (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required." });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = generateToken(decoded);
    res.status(200).json({ token: newAccessToken });
  } catch (err) {
    console.error("Token refresh error:", err);
    res.status(401).json({ message: "Invalid or expired refresh token." });
  }
});

router.post("/logout", (req, res) => {
  // 쿠키에서 refreshToken을 클리어
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.status(200).json({ message: "Logged out successfully." });
});

router.get("/users", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only." });
  }

  try {
    const [users] = await dbPromise.query(
      "SELECT id, username, email, role FROM users"
    );
    res.status(200).json({ users });
  } catch (err) {
    console.error(`User fetch error: ${err.message}`);
    res.status(500).json({ message: "Error fetching users." });
  }
});

module.exports = router;
