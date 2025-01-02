// server/orders.js
const express = require("express");
const jwt = require("jsonwebtoken");
const { dbPromise } = require("../config/db");

const router = express.Router();

// JWT 비밀 키 (환경 변수로 관리)
const JWT_SECRET = "your-jwt-secret";

// JWT 검증 함수
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// 주문 내역 조회
router.get("/orders", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer 토큰 방식
  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const decoded = verifyToken(token);
    const userId = decoded.id;

    // 주문 내역 조회
    const [orders] = await dbPromise.query(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    res.status(200).json({ orders });
  } catch (err) {
    console.error("Order Error:", err);
    res.status(500).json({ message: "Error fetching orders." });
  }
});

module.exports = router;
