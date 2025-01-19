require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const { dbPromise } = require("../config/db");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
console.log("JWT_SECRET:", JWT_SECRET);
console.log("JWT_REFRESH_SECRET:", JWT_REFRESH_SECRET);

// JWT 검증 미들웨어
const verifyToken = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
};

// 프로필 조회
router.get("/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "토큰이 제공되지 않았습니다." });
  }

  try {
    const decoded = await verifyToken(token, JWT_SECRET); // JWT_SECRET로 검증
    const userId = decoded.id;

    const [user] = await dbPromise.query(
      "SELECT id, username, email, phone FROM users WHERE id = ?",
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    res.status(200).json({ user: user[0] });
  } catch (err) {
    console.error("프로필 오류:", err);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "토큰이 만료되었습니다.",
        refreshTokenRequired: true, // 리프레시 토큰 사용을 유도
      });
    }
    res
      .status(500)
      .json({ message: "프로필을 가져오는 중 오류가 발생했습니다." });
  }
});

// 리프레시 토큰으로 액세스 토큰 재발급
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res
      .status(401)
      .json({ message: "리프레시 토큰이 제공되지 않았습니다." });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET); // 리프레시 토큰 검증
    const userId = decoded.id;

    const [user] = await dbPromise.query(
      "SELECT refresh_token FROM users WHERE id = ?",
      [userId]
    );

    if (!user.length || user[0].refresh_token !== refreshToken) {
      return res
        .status(403)
        .json({ message: "리프레시 토큰이 유효하지 않습니다." });
    }

    const accessToken = jwt.sign({ id: userId }, JWT_SECRET, {
      expiresIn: "1h", // 새 액세스 토큰 1시간 유효
    });

    res.status(200).json({ accessToken });
  } catch (err) {
    console.error("리프레시 토큰 오류:", err);
    res.status(500).json({ message: "리프레시 토큰 처리 중 오류 발생." });
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
    const decoded = await verifyToken(token, JWT_SECRET);
    const userId = decoded.id;

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
    const decoded = await verifyToken(token, JWT_SECRET);
    const userId = decoded.id;

    // 현재 사용자의 기본 배송지 여부 확인
    const [defaultAddress] = await dbPromise.query(
      "SELECT id FROM addresses WHERE user_id = ? AND isDefault = 1",
      [userId]
    );

    // 기본 배송지가 이미 있는 경우
    let finalIsDefault = defaultAddress.length === 0 ? 1 : 0;

    // 클라이언트에서 기본 배송지로 설정 요청 시
    if (isDefault && defaultAddress.length > 0) {
      // 기존 기본 배송지를 비활성화
      await dbPromise.query(
        "UPDATE addresses SET isDefault = 0 WHERE user_id = ?",
        [userId]
      );
      finalIsDefault = 1; // 새로 추가되는 주소를 기본 배송지로 설정
    }

    // 배송지 추가
    await dbPromise.query(
      "INSERT INTO addresses (user_id, recipient, phone, zipcode, roadAddress, detailAddress, isDefault) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        userId,
        recipient,
        phone,
        zipcode,
        roadAddress,
        detailAddress,
        finalIsDefault,
      ]
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
    const decoded = await verifyToken(token, JWT_SECRET);
    const userId = decoded.id;

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
    const decoded = await verifyToken(token, JWT_SECRET);
    const userId = decoded.id;

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

// 결제 내역 조회
router.get("/orders", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer 토큰

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const decoded = await verifyToken(token, JWT_SECRET);
    const userId = decoded.id;

    // payment 테이블에서 주문 내역과 결제 상태 조회
    const connection = await dbPromise;

    const query = `
      SELECT order_id, user_id, amount, order_name, address, cart_items, status, created_at,delivery_status
      FROM payment
      WHERE user_id = ?
    `;

    const [orders] = await connection.execute(query, [userId]);

    if (orders.length === 0) {
      // return res.status(404).json({ message: "No orders found." });
    }
    res.status(200).json({ orders });
  } catch (err) {
    console.error("Orders Error:", err);
    res.status(500).json({ message: "Error fetching orders." });
  }
});

// 리뷰 추가
router.post("/reviews", async (req, res) => {
  const { productId, rating, reviewText, thumbnail } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  if (!productId || !rating) {
    return res
      .status(400)
      .json({ message: "제품 ID와 평점은 필수 항목입니다." });
  }

  try {
    const decoded = await verifyToken(token, JWT_SECRET);
    const userId = decoded.id;

    // 리뷰 추가 시 썸네일 포함
    await dbPromise.query(
      "INSERT INTO reviews (user_id, product_id, rating, review_text, thumbnail) VALUES (?, ?, ?, ?, ?)",
      [userId, productId, rating, reviewText || null, thumbnail || null]
    );

    res.status(201).json({ message: "리뷰가 성공적으로 저장되었습니다." });
  } catch (err) {
    console.error("리뷰 저장 오류:", err);
    res.status(500).json({ message: "리뷰 저장 중 오류가 발생했습니다." });
  }
});

// 내 아이디로 작성한 리뷰 조회
router.get("/reviews", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const decoded = await verifyToken(token, JWT_SECRET);
    const userId = decoded.id;

    // 사용자가 작성한 리뷰들만 조회
    const [reviews] = await dbPromise.query(
      "SELECT r.product_id, r.rating, r.review_text, r.thumbnail, p.name AS product_name FROM reviews r JOIN products p ON r.product_id = p.id WHERE r.user_id = ?",
      [userId]
    );

    if (reviews.length === 0) {
    }

    res.status(200).json({ reviews });
  } catch (err) {
    console.error("리뷰 조회 오류:", err);
    res.status(500).json({ message: "리뷰 조회 중 오류가 발생했습니다." });
  }
});

module.exports = router;
