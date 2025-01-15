const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const { dbPromise } = require("../config/db"); // DB 연결
const { verifyToken } = require("../routes/auth"); // JWT 검증 미들웨어

// 결제 상태 업데이트 함수
const updatePaymentStatus = async (orderId, status) => {
  try {
    const connection = await dbPromise;
    const query = `
      UPDATE payment
      SET status = ?
      WHERE order_id = ?
    `;
    const values = [status, orderId];
    const [rows] = await connection.execute(query, values);
    console.log("결제 상태 업데이트 결과:", rows);
  } catch (error) {
    console.error("결제 상태 업데이트 실패:", error);
  }
};

// 결제 요청 처리
router.post("/", async (req, res) => {
  const { amount, orderName, address, user_id, cartItems } = req.body;

  // 요청 본문 출력 (디버깅용)
  console.log("결제 요청 데이터:", req.body);

  // 결제 데이터 검증
  if (!amount || !orderName || !address || !user_id || !cartItems) {
    return res.status(400).send({ message: "Invalid payment data" });
  }

  // 고유 주문 ID 생성
  const orderId = uuidv4();

  // 결제 정보 DB에 저장
  try {
    const connection = await dbPromise;

    const query = `INSERT INTO payment (order_id, user_id, amount, order_name, address, cart_items, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      orderId,
      user_id,
      amount,
      orderName,
      address,
      JSON.stringify(cartItems),
      "pending", // 결제 대기 상태로 시작
    ];

    await connection.execute(query, values); // MySQL 쿼리 실행

    res.status(200).send({
      orderId,
      amount,
      orderName,
    });
  } catch (error) {
    console.error("결제 정보 DB 저장 실패:", error);
    res.status(500).send({ message: "결제 정보 저장에 실패했습니다." });
  }
});

// 결제 성공 처리 (POST 요청)
router.post("/success", async (req, res) => {
  const { orderId, paymentKey, amount } = req.body;

  try {
    // 결제 상태 업데이트 (예: 데이터베이스에서 주문 상태 변경)
    await updatePaymentStatus(orderId, "success");

    res.redirect(
      `http://localhost:3000/api/payment/success?orderId=${orderId}&paymentKey=${paymentKey}&amount=${amount}`
    );
    // 결제 성공 응답
    res.status(200).send({
      message: "Payment successful",
      orderId,
      amount,
      status: "success", // 결제 성공 상태 반환
    });
  } catch (error) {
    console.error("결제 성공 처리 실패:", error);
    res.status(500).send({ message: "결제 처리에 실패했습니다." });
  }
});

// 결제 성공 처리 (GET 요청)
router.get("/success", async (req, res) => {
  const { orderId, paymentKey, amount } = req.query;

  if (!orderId || !paymentKey || !amount) {
    return res.status(400).send({ message: "결제 성공 정보가 부족합니다." });
  }

  try {
    // 결제 상태 업데이트
    await updatePaymentStatus(orderId, "success");

    // 클라이언트에 결제 성공 데이터를 보내며 리디렉션
    res.redirect(
      `http://localhost:3000/payment-success?orderId=${orderId}&paymentKey=${paymentKey}&amount=${amount}`
    );
  } catch (error) {
    console.error("결제 성공 처리 실패:", error);
    res.status(500).send({ message: "결제 처리에 실패했습니다." });
  }
});

// 결제 실패 처리 (POST 요청)
router.post("/failed", async (req, res) => {
  const { orderId } = req.body;

  try {
    await updatePaymentStatus(orderId, "failed");
    res.status(200).send({ message: "Payment failed" });
  } catch (error) {
    console.error("결제 실패 처리 실패:", error);
    res.status(500).send({ message: "결제 처리에 실패했습니다." });
  }
});

// 결제 취소 처리 (POST 요청)
router.post("/cancel", async (req, res) => {
  const { orderId } = req.body;

  try {
    await updatePaymentStatus(orderId, "canceled");
    res.status(200).send({ message: "Payment canceled" });
  } catch (error) {
    console.error("결제 취소 처리 실패:", error);
    res.status(500).send({ message: "결제 취소에 실패했습니다." });
  }
});

module.exports = router;
