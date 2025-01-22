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

// 결제 성공 처리 (POST 요청)
router.post("/success", async (req, res) => {
  const { orderId, paymentKey, amount, userId, cartItems } = req.body;

  if (!orderId || !userId || !cartItems) {
    return res.status(400).send({ message: "결제 성공 정보가 부족합니다." });
  }

  try {
    // 결제 상태 업데이트
    await updatePaymentStatus(orderId, "success");

    // 장바구니에서 품목 삭제
    await deleteCartItems(userId, cartItems);

    // 결제 성공 후 리디렉션
    res.redirect(
      `http://localhost:3000/payment-success?orderId=${orderId}&paymentKey=${paymentKey}&amount=${amount}`
    );
  } catch (error) {
    console.error("결제 성공 처리 실패:", error);
    res.status(500).send({ message: "결제 성공 처리 중 오류가 발생했습니다." });
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
router.post("/success", async (req, res) => {
  const { orderId, paymentKey, amount, userId, cartItems } = req.body;

  if (!orderId || !userId || !cartItems) {
    return res.status(400).send({ message: "결제 성공 정보가 부족합니다." });
  }

  try {
    // 결제 상태 업데이트
    await updatePaymentStatus(orderId, "success");

    // 장바구니에서 품목 삭제 (각 품목에 대해 DELETE 쿼리 실행)
    const connection = await dbPromise;

    // cartItems 배열을 반복하면서 각 품목 삭제 쿼리 실행
    for (const item of cartItems) {
      const query = `
        DELETE FROM cart
        WHERE user_id = ? AND product_id = ?
      `;
      const values = [userId, item.productId];

      // 쿼리 실행
      const [result] = await connection.execute(query, values);

      if (result.affectedRows > 0) {
        console.log(
          `장바구니에서 상품 (productId: ${item.productId})이(가) 삭제되었습니다.`
        );
      } else {
        console.log(
          `장바구니에서 상품 (productId: ${item.productId})이(가) 존재하지 않습니다.`
        );
      }
    }

    // 결제 성공 후 리디렉션
    res.redirect(
      `http://localhost:3000/payment-success?orderId=${orderId}&paymentKey=${paymentKey}&amount=${amount}`
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
