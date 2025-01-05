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

    // 배송지 목록 조회 (수정된 필드들 포함)
    const [addresses] = await dbPromise.query(
      "SELECT id, recipient, phone, zipcode, roadAddress, detailAddress, isDefault FROM addresses WHERE user_id = ?",
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
  const { recipient, phone, zipcode, roadAddress, detailAddress, isDefault } =
    req.body;
  const token = req.headers.authorization?.split(" ")[1]; // Bearer 토큰

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const decoded = await verifyToken(token);
    const userId = decoded.id;

    // 새로운 주소 추가 (수정된 필드들 포함)
    await dbPromise.query(
      "INSERT INTO addresses (user_id, recipient, phone, zipcode, roadAddress, detailAddress, isDefault) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [userId, recipient, phone, zipcode, roadAddress, detailAddress, isDefault]
    );

    res.status(201).json({ message: "Address added successfully" });
  } catch (err) {
    console.error("Add Address Error:", err);
    res.status(500).json({ message: "Error adding address." });
  }
});

// 배송지 업데이트
router.put("/addresses/:id", async (req, res) => {
  const { recipient, phone, zipcode, roadAddress, detailAddress, isDefault } =
    req.body;
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

    // 배송지 업데이트
    await dbPromise.query(
      "UPDATE addresses SET recipient = ?, phone = ?, zipcode = ?, roadAddress = ?, detailAddress = ?, isDefault = ? WHERE id = ? AND user_id = ?",
      [
        recipient,
        phone,
        zipcode,
        roadAddress,
        detailAddress,
        isDefault,
        id,
        userId,
      ]
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

    // 배송지 삭제
    await dbPromise.query(
      "DELETE FROM addresses WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (err) {
    console.error("Delete Address Error:", err);
    res.status(500).json({ message: "Error deleting address." });
  }
}); // 카드 추가
router.post("/cards", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "토큰이 제공되지 않았습니다." });
  }

  try {
    const decoded = await verifyToken(token);
    const userId = decoded.id;
    const { cardBrand, cardNumber, expiryMonth, expiryYear, cvv, cardHolder } =
      req.body;

    // 카드 번호 유효성 검사 (16자리 숫자)
    const fullCardNumber = cardNumber.replace(/\s/g, ""); // 공백 제거
    if (!/^\d{16}$/.test(fullCardNumber)) {
      return res
        .status(400)
        .json({ message: "카드 번호는 16자리 숫자여야 합니다." });
    }

    // 유효한 만료일인지 체크 (MM, YY 형식)
    if (!/^(0[1-9]|1[0-2])$/.test(expiryMonth) || !/^\d{2}$/.test(expiryYear)) {
      return res.status(400).json({ message: "유효한 만료일을 입력해주세요." });
    }

    // CVV 유효성 검사 (3자리 숫자)
    if (!/^\d{3}$/.test(cvv)) {
      return res.status(400).json({ message: "CVV는 3자리 숫자여야 합니다." });
    }

    // 카드 정보 삽입
    const [result] = await dbPromise.query(
      "INSERT INTO cards (user_id, card_brand, card_number, expiryMonth, expiryYear, cvv, cardHolder) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        userId,
        cardBrand,
        fullCardNumber,
        expiryMonth,
        expiryYear,
        cvv,
        cardHolder,
      ]
    );

    if (result.affectedRows > 0) {
      res.status(201).json({ message: "카드가 등록되었습니다." });
    } else {
      res.status(400).json({ message: "카드 등록에 실패했습니다." });
    }
  } catch (err) {
    console.error("Card Error:", err);
    res.status(500).json({ message: "카드 등록에 실패했습니다." });
  }
});

// 카드 목록 조회
router.get("/cards", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "토큰이 제공되지 않았습니다." });
  }

  try {
    const decoded = await verifyToken(token);
    const userId = decoded.id;

    const [cards] = await dbPromise.query(
      "SELECT * FROM cards WHERE user_id = ?",
      [userId]
    );

    res.status(200).json({ cards });
  } catch (err) {
    console.error("Cards Error:", err);
    res.status(500).json({ message: "카드 조회에 실패했습니다." });
  }
});

// 카드 삭제
router.delete("/cards/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "토큰이 제공되지 않았습니다." });
  }

  try {
    const decoded = await verifyToken(token);
    const userId = decoded.id;
    const cardId = req.params.id;

    const [result] = await dbPromise.query(
      "DELETE FROM cards WHERE id = ? AND user_id = ?",
      [cardId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "카드를 찾을 수 없습니다." });
    }

    res.status(200).json({ message: "카드가 삭제되었습니다." });
  } catch (err) {
    console.error("Delete Card Error:", err);
    res.status(500).json({ message: "카드 삭제에 실패했습니다." });
  }
});
module.exports = router;
