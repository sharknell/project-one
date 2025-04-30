const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const { dbPromise } = require("../config/db"); // DB 연결

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

  console.log("결제 요청 데이터:", req.body);

  if (!amount || !orderName || !address || !user_id || !cartItems) {
    return res.status(400).send({ message: "Invalid payment data" });
  }

  const orderId = uuidv4(); // 고유 주문 ID 생성

  try {
    const connection = await dbPromise;

    // 결제 정보 저장
    const query = `
      INSERT INTO payment (order_id, user_id, amount, order_name, address, cart_items, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      orderId,
      user_id,
      amount,
      orderName,
      address,
      JSON.stringify(cartItems),
      "pending",
    ];
    await connection.execute(query, values);

    console.log(`결제 정보 저장 성공. 주문 ID: ${orderId}`);

    // 장바구니 데이터 삭제
    const deleteCartQuery = `
      DELETE FROM cart WHERE user_id = ?
    `;
    await connection.execute(deleteCartQuery, [user_id]);
    console.log(`사용자 ${user_id}의 장바구니 데이터 삭제 완료.`);

    res.status(200).send({ orderId, amount, orderName });
  } catch (error) {
    console.error("결제 정보 DB 저장 실패:", error);
    res.status(500).send({ message: "결제 정보 저장에 실패했습니다." });
  }
});

// 결제 성공 처리 (GET 요청)
router.get("/success", async (req, res) => {
  const { orderId, paymentKey, amount } = req.query;

  if (!orderId || !paymentKey || !amount) {
    return res.status(400).send({ message: "결제 성공 정보가 부족합니다." });
  }

  try {
    await updatePaymentStatus(orderId, "success");

    // 🔄 변경된 부분: #/ 사용하여 HashRouter 호환되도록
    res.redirect(
      `http://localhost:3000/#/payment-success?orderId=${orderId}&paymentKey=${paymentKey}&amount=${amount}`
    );
  } catch (error) {
    console.error("결제 성공 처리 실패:", error);
    res.status(500).send({ message: "결제 처리에 실패했습니다." });
  }
});

// 결제 성공 처리 (POST 요청)
router.post("/success", async (req, res) => {
  const { orderId, paymentKey, amount, userId, cartItems } = req.body;

  if (!orderId || !userId || !cartItems) {
    return res.status(400).send({ message: "결제 성공 정보가 부족합니다." });
  }

  try {
    await updatePaymentStatus(orderId, "success");

    const connection = await dbPromise;
    for (const item of cartItems) {
      const query = `DELETE FROM cart WHERE user_id = ? AND product_id = ?`;
      const values = [userId, item.productId || null];
      await connection.execute(query, values);
    }

    // 🔄 변경된 부분: #/ 사용
    res.redirect(
      `http://localhost:3000/#/payment-success?orderId=${orderId}&paymentKey=${paymentKey}&amount=${amount}`
    );
  } catch (error) {
    console.error("결제 성공 처리 실패:", error);
    res.status(500).send({ message: "결제 성공 처리 중 오류가 발생했습니다." });
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
    res.status(500).send({ message: "결제 실패 처리 중 오류가 발생했습니다." });
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
