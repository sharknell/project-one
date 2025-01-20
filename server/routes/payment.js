const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const { dbPromise } = require("../config/db"); // DB 연결

// 결제 상태 업데이트 함수
const updatePaymentStatus = async (orderId, status) => {
  try {
    const connection = await dbPromise;
    const query = `UPDATE payment
      SET status = ?
      WHERE order_id = ?`;
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

  console.log("결제 요청 데이터:", req.body); // 요청 데이터 확인

  if (!amount || !orderName || !address || !user_id || !cartItems) {
    return res.status(400).send({ message: "Invalid payment data" });
  }

  const orderId = uuidv4(); // 고유 주문 ID 생성

  try {
    const connection = await dbPromise;

    // cartItems에 productId가 포함되도록 수정
    const query = `INSERT INTO payment (order_id, user_id, amount, order_name, address, cart_items, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      orderId,
      user_id,
      amount,
      orderName,
      address,
      JSON.stringify(
        cartItems.map((item) => ({
          productId: item.productId, // productId 추가
          productName: item.productName,
          productSize: item.productSize,
          quantity: item.quantity,
          thumbnail: item.thumbnail,
        }))
      ),
      "pending", // 초기 상태는 결제 대기로 설정
    ];

    // 결제 정보 DB에 저장
    await connection.execute(query, values);

    console.log(`결제 정보 저장 성공. 주문 ID: ${orderId}`);

    res.status(200).send({ orderId, amount, orderName });
  } catch (error) {
    console.error("결제 정보 DB 저장 실패:", error);
    res.status(500).send({ message: "결제 정보 저장에 실패했습니다." });
  }
});

// 결제 성공 처리
router.post("/success", async (req, res) => {
  const { orderId, paymentKey, amount, userId } = req.body;

  if (!orderId || !userId) {
    return res.status(400).send({ message: "결제 성공 정보가 부족합니다." });
  }

  const connection = await dbPromise;

  try {
    // 트랜잭션 시작
    await connection.beginTransaction();

    // 1. 결제 상태 업데이트
    const updatePaymentQuery = `UPDATE payment
      SET status = ?
      WHERE order_id = ?`;
    await connection.execute(updatePaymentQuery, ["success", orderId]);

    // 2. 장바구니 초기화
    const deleteCartQuery = `DELETE FROM cart
      WHERE user_id = ?`;
    const [result] = await connection.execute(deleteCartQuery, [userId]);

    if (result.affectedRows === 0) {
      console.warn(`사용자 ${userId}의 장바구니가 비어있거나 삭제 실패.`);
    } else {
      console.log(
        `사용자 ${userId}의 장바구니 항목 ${result.affectedRows}개 삭제 완료.`
      );
    }

    // 트랜잭션 커밋
    await connection.commit();

    // 응답
    res.status(200).send({
      message: "결제가 성공적으로 처리되었습니다.",
      orderId,
      paymentKey,
      amount,
    });
  } catch (error) {
    // 트랜잭션 롤백
    await connection.rollback();
    console.error("결제 성공 처리 중 오류 발생:", error);
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
