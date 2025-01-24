const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { dbPromise } = require("../config/db");

const router = express.Router();

// JWT 비밀 키 (환경 변수로 관리 권장)
const JWT_SECRET = "your-jwt-secret";

// JWT 생성 함수
const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role, // role을 추가하여 JWT 토큰에 포함
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "6h" }); // 토큰 유효시간: 6시간
};

// JWT 검증 미들웨어
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // "Bearer {token}" 형태
  if (!token) {
    return res.status(401).json({ message: "Token is required." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // 디코딩된 사용자 정보 저장
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired. Please refresh." });
    }
    return res.status(403).json({ message: "Authentication failed." });
  }
};

// 로그인 라우트
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

    const token = generateToken(user[0]);

    // 로그인한 사용자의 정보 출력 (어드민 및 일반회원 구분)
    console.log(`User Logged In: ${user[0].username} (${user[0].role})`);

    const roleMessage =
      user[0].role === "admin"
        ? "Admin login successful!"
        : "User login successful!";

    res.status(200).json({ message: roleMessage, token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Error during login process." });
  }
});

// 회원가입 라우트
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const [existingUser] = await dbPromise.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ message: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await dbPromise.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'user')", // 기본값은 'user'
      [username, email, hashedPassword]
    );

    res
      .status(201)
      .json({ message: "Signup successful!", userId: result.insertId });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Error during signup process." });
  }
});

// 토큰 갱신 라우트
router.post("/refresh-token", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
    const newToken = generateToken({
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role, // 갱신된 토큰에도 role 포함
    });

    res.status(200).json({ token: newToken });
  } catch (err) {
    console.error("Token Refresh Error:", err);
    res.status(401).json({ message: "Invalid or expired token." });
  }
});

// 회원 목록 조회 라우트 (어드민만 접근 가능)
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
    console.error("User Fetch Error:", err);
    res.status(500).json({ message: "Error fetching users." });
  }
});

module.exports = router;
