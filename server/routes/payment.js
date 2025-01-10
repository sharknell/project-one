const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const { dbPromise } = require("../config/db"); // dbPromise 임포트

// /api/payment POST 요청 처리
router.post("/", (req, res) => {
  const { amount, orderName } = req.body;

  // 결제 데이터 검증
  if (!amount || !orderName) {
    return res.status(400).send({ message: "Invalid payment data" });
  }

  // 고유 주문 ID 생성
  const orderId = uuidv4(); // uuidv4()로 고유 ID 생성

  res.status(200).send({
    orderId,
    amount,
    orderName,
  });
});

// POST 요청 처리 (결제 성공)
router.post("/success", async (req, res) => {
  const { orderId, amount, orderName } = req.body;

  if (!orderId || !amount || !orderName) {
    return res.status(400).send({ message: "결제 정보가 올바르지 않습니다." });
  }

  try {
    // 결제 정보를 데이터베이스에 저장
    const query = `
      INSERT INTO payments (order_id, order_name, amount, payment_status)
      VALUES (?, ?, ?, 'SUCCESS')
    `;
    await dbPromise.query(query, [orderId, orderName, amount]);

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

  // 결제 정보 검증
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

  // 결제 정보 검증
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

module.exports = router;
