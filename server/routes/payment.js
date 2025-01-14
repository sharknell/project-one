const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const { dbPromise } = require("../config/db");
const { verifyToken } = require("../routes/auth"); // JWT 검증 미들웨어 임포트

// 결제 데이터 요청
router.post("/", (req, res) => {
  const { amount, orderName } = req.body;

  // 결제 데이터 검증
  if (!amount || !orderName) {
    return res.status(400).send({ message: "Invalid payment data" });
  }

  // 고유 주문 ID 생성
  const orderId = uuidv4();

  res.status(200).send({
    orderId,
    amount,
    orderName,
  });
});

// /api/payment/success 엔드포인트 수정 (하나로 통합)
router.get("/success", async (req, res) => {
  const { orderId, amount, orderName, userId } = req.query; // 사용자 ID를 포함

  if (!orderId || !amount || !orderName || !userId) {
    return res.status(400).send({ message: "결제 정보가 올바르지 않습니다." });
  }

  try {
    const query = `
      INSERT INTO payments (order_id, order_name, amount, payment_status, user_id)
      VALUES (?, ?, ?, 'SUCCESS', ?)
    `;
    console.log("Executing query:", query, [
      orderId,
      orderName,
      amount,
      userId,
    ]);
    await dbPromise.query(query, [orderId, orderName, amount, userId]);
    console.log("결제 성공! 내역이 저장되었습니다.");
    res.send({ message: "결제가 성공적으로 처리되었습니다." });
  } catch (error) {
    console.error("결제 내역 저장 오류:", error);
    res.status(500).send({ message: "결제 내역 저장 중 오류가 발생했습니다." });
  }
});

// 결제 실패 처리
router.post("/fail", async (req, res) => {
  const { orderId, amount, orderName } = req.body;

  if (!orderId || !amount || !orderName) {
    return res.status(400).send({ message: "결제 정보가 올바르지 않습니다." });
  }

  try {
    // 실패 내역 저장
    const query = `
      INSERT INTO payments (order_id, order_name, amount, payment_status)
      VALUES (?, ?, ?, 'FAILED')
    `;
    await dbPromise.query(query, [orderId, orderName, amount]);

    console.log("결제 실패! 내역이 저장되었습니다.");
    res.send("결제가 실패하였습니다.");
  } catch (error) {
    console.error("결제 내역 저장 오류:", error);
    res.status(500).send({ message: "결제 내역 저장 중 오류가 발생했습니다." });
  }
});

// 결제 취소 처리
router.post("/cancel", async (req, res) => {
  const { orderId, amount, orderName } = req.body;

  if (!orderId || !amount || !orderName) {
    return res.status(400).send({ message: "결제 정보가 올바르지 않습니다." });
  }

  try {
    // 취소 내역 저장
    const query = `
      INSERT INTO payments (order_id, order_name, amount, payment_status)
      VALUES (?, ?, ?, 'CANCELLED')
    `;
    await dbPromise.query(query, [orderId, orderName, amount]);

    console.log("결제 취소! 내역이 저장되었습니다.");
    res.send("결제가 취소되었습니다.");
  } catch (error) {
    console.error("결제 내역 저장 오류:", error);
    res.status(500).send({ message: "결제 내역 저장 중 오류가 발생했습니다." });
  }
});

// 결제 내역 조회 (사용자별)
router.get("/orders/user", verifyToken, async (req, res) => {
  const userId = req.user.id; // 로그인된 사용자 ID를 사용하여 결제 내역 조회

  try {
    // 사용자별 결제 내역을 가져오는 쿼리
    const query = `
      SELECT * FROM payments WHERE user_id = ?
    `;
    const [results] = await dbPromise.query(query, [userId]);

    if (results.length === 0) {
      return res.status(404).send({ message: "결제 내역이 없습니다." });
    }

    res.status(200).send({ orders: results });
  } catch (error) {
    console.error("결제 내역 조회 오류:", error);
    res
      .status(500)
      .send({ message: "결제 내역을 가져오는 중 오류가 발생했습니다." });
  }
});

module.exports = router;
