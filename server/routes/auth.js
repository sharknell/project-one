require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { dbPromise } = require("../config/db");
const winston = require("winston");

const router = express.Router();

// 환경 변수 설정
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10) || 12;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

// 로깅 설정
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

// 리프레시 토큰 저장 (메모리 기반, 실무에서는 DB 사용 권장)
const refreshTokens = new Map();

// 토큰 생성 함수
const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

const generateRefreshToken = (user) => {
  const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
  refreshTokens.set(user.id, refreshToken);
  return refreshToken;
};

// JWT 검증 미들웨어
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token is required." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    logger.error(`Token verification failed: ${err.message}`);
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired. Please refresh your token." });
    }
    return res.status(403).json({ message: "Authentication failed." });
  }
};

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

// 회원가입
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // 비밀번호 정책 검증
  if (
    password.length < 8 ||
    !/\d/.test(password) ||
    !/[A-Za-z]/.test(password)
  ) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long and include letters and numbers.",
    });
  }

  try {
    const [existingUser] = await dbPromise.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ message: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await dbPromise.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'user')",
      [username, email, hashedPassword]
    );

    logger.info(`User signed up: ${email}`);
    res
      .status(201)
      .json({ message: "Signup successful!", userId: result.insertId });
  } catch (err) {
    logger.error(`Signup error: ${err.message}`);
    res.status(500).json({ message: "Error during signup process." });
  }
});

// 토큰 갱신
router.post("/refresh-token", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required." });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    if (
      !refreshTokens.has(decoded.id) ||
      refreshTokens.get(decoded.id) !== refreshToken
    ) {
      return res.status(403).json({ message: "Invalid refresh token." });
    }

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
