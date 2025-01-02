require("dotenv").config(); // .env 파일 로드
const express = require("express");
const jwt = require("jsonwebtoken");
const { dbPromise } = require("../config/db");

const router = express.Router();

// JWT 비밀 키
const JWT_SECRET = process.env.JWT_SECRET;

// JWT 검증 함수
const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
};

// 사용자 정보 조회
router.get("/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer 토큰

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const decoded = await verifyToken(token);
    const userId = decoded.id;

    const [user] = await dbPromise.query(
      "SELECT id, username, email, phone, default_shipping_address FROM users WHERE id = ?",
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ user: user[0] });
  } catch (err) {
    console.error("Profile Error:", err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid or malformed token." });
    }
    res.status(500).json({ message: "Error fetching profile." });
  }
});

// 프로필 업데이트
router.put("/update", async (req, res) => {
  const { username, email, phone } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    await dbPromise.query(
      "UPDATE users SET username = ?, email = ?, phone = ? WHERE id = ?",
      [username, email, phone, decoded.id]
    );

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// 배송지 목록 조회
router.get("/addresses", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer 토큰

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const decoded = await verifyToken(token);
    const userId = decoded.id;

    const [addresses] = await dbPromise.query(
      "SELECT id, street, city, state, zip FROM addresses WHERE user_id = ?",
      [userId]
    );

    res.status(200).json({ addresses });
  } catch (err) {
    console.error("Addresses Error:", err);
    res.status(500).json({ message: "Error fetching addresses." });
  }
});

// 배송지 추가
router.post("/addresses", async (req, res) => {
  const { street, city, state, zip } = req.body;
  const token = req.headers.authorization?.split(" ")[1]; // Bearer 토큰

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const decoded = await verifyToken(token);
    const userId = decoded.id;

    await dbPromise.query(
      "INSERT INTO addresses (user_id, street, city, state, zip) VALUES (?, ?, ?, ?, ?)",
      [userId, street, city, state, zip]
    );

    res.status(201).json({ message: "Address added successfully" });
  } catch (err) {
    console.error("Add Address Error:", err);
    res.status(500).json({ message: "Error adding address." });
  }
});

// 배송지 업데이트
router.put("/addresses/:id", async (req, res) => {
  const { street, city, state, zip } = req.body;
  const { id } = req.params;
  const token = req.headers.authorization?.split(" ")[1]; // Bearer 토큰

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const decoded = await verifyToken(token);
    const userId = decoded.id;

    // 배송지가 사용자의 것인지 확인
    const [existingAddress] = await dbPromise.query(
      "SELECT id FROM addresses WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existingAddress.length === 0) {
      return res
        .status(404)
        .json({ message: "Address not found or unauthorized." });
    }

    await dbPromise.query(
      "UPDATE addresses SET street = ?, city = ?, state = ?, zip = ? WHERE id = ? AND user_id = ?",
      [street, city, state, zip, id, userId]
    );

    res.status(200).json({ message: "Address updated successfully" });
  } catch (err) {
    console.error("Update Address Error:", err);
    res.status(500).json({ message: "Error updating address." });
  }
});

// 배송지 삭제
router.delete("/addresses/:id", async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization?.split(" ")[1]; // Bearer 토큰

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const decoded = await verifyToken(token);
    const userId = decoded.id;

    // 배송지가 사용자의 것인지 확인
    const [existingAddress] = await dbPromise.query(
      "SELECT id FROM addresses WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existingAddress.length === 0) {
      return res
        .status(404)
        .json({ message: "Address not found or unauthorized." });
    }

    await dbPromise.query(
      "DELETE FROM addresses WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (err) {
    console.error("Delete Address Error:", err);
    res.status(500).json({ message: "Error deleting address." });
  }
});

module.exports = router;
