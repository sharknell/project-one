const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { dbPromise } = require("../config/db");

const router = express.Router();

// JWT 비밀 키 (환경 변수로 관리)
const JWT_SECRET = "your-jwt-secret";

// JWT 검증 함수
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// JWT 토큰 생성 함수
const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" }); // 1시간 유효한 토큰
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
    // 이메일로 사용자 검색
    const [user] = await dbPromise.query(
      "SELECT id, username, password FROM users WHERE email = ?",
      [email]
    );

    // 사용자 정보가 없으면 404 반환
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    // 비밀번호 해시 비교
    console.log("Retrieved user:", user); // 로그로 사용자 정보 확인
    const match = await bcrypt.compare(password, user[0].password); // user[0].password

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // 로그인 성공 시 토큰 생성
    const token = generateToken(user[0]);

    res.status(200).json({ message: "Login successful!", token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Error during login process." });
  }
});

// 카카오 로그인 처리
router.post("/kakao-login", async (req, res) => {
  const { accessToken } = req.body;

  try {
    const response = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // 카카오에서 받은 사용자 정보를 토대로 인증 처리
    const kakaoUser = response.data;

    // 사용자 정보로 로그인 처리 (예: JWT 발급)
    const token = generateToken(kakaoUser); // JWT 생성 로직 필요
    res.json({ token });
  } catch (error) {
    console.error("Kakao Login Error:", error);
    res.status(500).json({ error: "Kakao Login failed" });
  }
});

// 회원가입 라우트
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // 이메일 중복 확인
    const [existingUser] = await dbPromise.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ message: "Email already in use." });
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새 사용자 추가
    const [result] = await dbPromise.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
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

module.exports = router;
