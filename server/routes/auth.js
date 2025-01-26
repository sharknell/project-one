// auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const { dbPromise } = require("../config/db");
const {
  generateToken,
  generateRefreshToken,
  verifyToken,
} = require("./tokenUtils");
const winston = require("winston");

const router = express.Router();

// 로깅 설정 (여기서는 그대로 유지)
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: "server.log" }),
    new winston.transports.Console(),
  ],
});

// 로그인
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
      logger.info(`Login failed: User not found for email ${email}`);
      return res.status(404).json({ message: "User not found." });
    }

    const match = await bcrypt.compare(password, user[0].password);
    if (!match) {
      logger.info(`Login failed: Invalid password for email ${email}`);
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const accessToken = generateToken(user[0]);
    const refreshToken = generateRefreshToken(user[0]);

    logger.info(`User logged in: ${user[0].email} (${user[0].role})`);
    res.status(200).json({ token: accessToken, refreshToken });
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    res.status(500).json({ message: "Error during login process." });
  }
});

// 리프레시 토큰을 통한 새로운 액세스 토큰 발급
router.post("/refresh-token", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required." });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    };
    const newAccessToken = generateToken(user);

    logger.info(`Token refreshed for user ID: ${decoded.id}`);
    res.status(200).json({ token: newAccessToken });
  } catch (err) {
    logger.error(`Token refresh error: ${err.message}`);
    res.status(401).json({ message: "Invalid or expired refresh token." });
  }
});

// 회원 목록 조회 (어드민 전용)
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
    logger.error(`User fetch error: ${err.message}`);
    res.status(500).json({ message: "Error fetching users." });
  }
});

module.exports = router;
