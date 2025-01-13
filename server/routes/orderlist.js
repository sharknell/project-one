const express = require("express");
const { authenticateUser } = require("../middleware/authenticateToken");

const router = express.Router();

router.get("/orderlist", authenticateUser, async (req, res) => {
  try {
    // 주문 목록 데이터베이스 조회 로직
    const orders = []; // 예제 데이터
    res.status(200).json({ data: orders });
  } catch (error) {
    console.error("주문 목록 조회 실패:", error);
    res.status(500).json({ message: "주문 목록 조회 실패" });
  }
});

module.exports = router;
