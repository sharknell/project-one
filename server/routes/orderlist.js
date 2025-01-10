const express = require("express");
const router = express.Router();
const { dbPromise } = require("../config/db"); // DB 연결 가져오기
const authenticateToken = require("../middleware/authenticateToken"); // 인증 미들웨어

// 주문 내역 조회 API
router.get("/", authenticateToken, async (req, res) => {
  try {
    const connection = await dbPromise.getConnection();
    const [orders] = await connection.query(
      "SELECT * FROM orders WHERE user_id = ?",
      [req.user.id] // 인증된 사용자 ID 기반으로 주문 내역 조회
    );
    connection.release();
    res.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res
      .status(500)
      .json({ message: "주문 내역을 가져오는 중 오류가 발생했습니다." });
  }
});

module.exports = router;
