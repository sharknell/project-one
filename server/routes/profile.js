require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const { dbPromise } = require("../config/db");
const { verifyToken } = require("./tokenUtils");
const router = express.Router();

// 환경 변수 검증
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("JWT_SECRET or JWT_REFRESH_SECRET is not defined.");
}

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

    // 만료 시간 계산
    const expirationTime = decoded.exp * 1000; // exp는 초 단위로 되어 있으므로 밀리초로 변환
    const currentTime = Date.now();
    const timeRemaining = Math.max(expirationTime - currentTime, 0); // 남은 시간 (음수 방지)

    // 토큰 만료 시간 출력 (초 단위)
    console.log(
      `Token expires in: ${Math.floor(timeRemaining / 1000)} seconds`
    );

    const newAccessToken = generateToken(user);

    res.status(200).json({ token: newAccessToken });
  } catch (err) {
    console.error(`Token refresh error: ${err.message}`);
    res.status(401).json({ message: "Invalid or expired refresh token." });
  }
});

// 프로필 조회
router.get("/profile", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
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
    res
      .status(500)
      .json({ message: "프로필을 가져오는 중 오류가 발생했습니다." });
  }
});

// 프로필 업데이트
router.put("/update", verifyToken, async (req, res) => {
  const { username, email, phone } = req.body;
  const userId = req.user.id;

  try {
    await dbPromise.query(
      "UPDATE users SET username = ?, email = ?, phone = ? WHERE id = ?",
      [username, email, phone, userId]
    );

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// 배송지 목록 조회
router.get("/addresses", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
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
router.post("/addresses", verifyToken, async (req, res) => {
  const { recipient, phone, zipcode, roadAddress, detailAddress, isDefault } =
    req.body;
  const userId = req.user.id;

  try {
    const [defaultAddress] = await dbPromise.query(
      "SELECT id FROM addresses WHERE user_id = ? AND isDefault = 1",
      [userId]
    );

    let finalIsDefault = defaultAddress.length === 0 ? 1 : 0;

    if (isDefault && defaultAddress.length > 0) {
      await dbPromise.query(
        "UPDATE addresses SET isDefault = 0 WHERE user_id = ?",
        [userId]
      );
      finalIsDefault = 1;
    }

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

// 주소 수정
router.put("/addresses/:id", verifyToken, async (req, res) => {
  const { recipient, phone, zipcode, roadAddress, detailAddress, isDefault } =
    req.body;
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // 해당 주소가 사용자의 것인지 확인
    const [existingAddress] = await dbPromise.query(
      "SELECT id FROM addresses WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existingAddress.length === 0) {
      return res
        .status(404)
        .json({ message: "해당 주소를 찾을 수 없거나 권한이 없습니다." });
    }

    // 기본 배송지 설정 시 기존 기본 주소 초기화
    if (isDefault) {
      await dbPromise.query(
        "UPDATE addresses SET isDefault = 0 WHERE user_id = ?",
        [userId]
      );
    }

    await dbPromise.query(
      `UPDATE addresses 
       SET recipient = ?, phone = ?, zipcode = ?, roadAddress = ?, detailAddress = ?, isDefault = ? 
       WHERE id = ? AND user_id = ?`,
      [
        recipient,
        phone,
        zipcode,
        roadAddress,
        detailAddress,
        isDefault ? 1 : 0,
        id,
        userId,
      ]
    );

    res.status(200).json({ message: "주소가 성공적으로 수정되었습니다." });
  } catch (err) {
    console.error("주소 수정 오류:", err);
    res.status(500).json({ message: "주소 수정 중 오류가 발생했습니다." });
  }
});

router.delete("/addresses/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // 해당 주소가 사용자의 것인지 확인
    const [existingAddress] = await dbPromise.query(
      "SELECT id FROM addresses WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existingAddress.length === 0) {
      return res
        .status(404)
        .json({ message: "해당 주소를 찾을 수 없거나 권한이 없습니다." });
    }

    await dbPromise.query("DELETE FROM addresses WHERE id = ?", [id]);

    res.status(200).json({ message: "주소가 성공적으로 삭제되었습니다." });
  } catch (err) {
    console.error("주소 삭제 오류:", err);
    res.status(500).json({ message: "주소 삭제 중 오류가 발생했습니다." });
  }
});

// 결제 내역 조회
router.get("/orders", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const query = `
      SELECT order_id, user_id, amount, order_name, address, cart_items, status, created_at, delivery_status
      FROM payment
      WHERE user_id = ?
    `;
    const [orders] = await dbPromise.query(query, [userId]);

    res.status(200).json({ orders });
  } catch (err) {
    console.error("Orders Error:", err);
    res.status(500).json({ message: "Error fetching orders." });
  }
});

// 리뷰 추가
router.post("/reviews", verifyToken, async (req, res) => {
  const { productId, rating, reviewText, thumbnail } = req.body;
  const userId = req.user.id;

  if (!productId || !rating) {
    return res
      .status(400)
      .json({ message: "제품 ID와 평점은 필수 항목입니다." });
  }

  try {
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
// 모든 결제 내역 조회
router.get("/all-orders", verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT order_id, user_id, amount, order_name, address, cart_items, status, created_at, delivery_status
      FROM payment
    `;
    const [orders] = await dbPromise.query(query);

    res.status(200).json({ orders });
  } catch (err) {
    console.error("All Orders Error:", err);
    res.status(500).json({ message: "Error fetching all orders." });
  }
});

// 내 아이디로 작성한 리뷰 조회
router.get("/reviews", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [reviews] = await dbPromise.query(
      "SELECT r.product_id, r.rating, r.review_text, r.thumbnail, p.name AS product_name FROM reviews r JOIN products p ON r.product_id = p.id WHERE r.user_id = ?",
      [userId]
    );

    res.status(200).json({ reviews });
  } catch (err) {
    console.error("리뷰 조회 오류:", err);
    res.status(500).json({ message: "리뷰 조회 중 오류가 발생했습니다." });
  }
});

module.exports = router;
