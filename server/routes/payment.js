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

const clearCart = async (userId, cartItems) => {
  try {
    const connection = await dbPromise;
    await connection.beginTransaction(); // 트랜잭션 시작

    for (const item of cartItems) {
      console.log(
        `삭제할 상품 ID: ${item.productId}, 상품 이름: ${item.productName}`
      );
      const query = "DELETE FROM cart WHERE user_id = ? AND product_id = ?";
      const values = [userId, item.productId];
      const [result] = await connection.execute(query, values);

      if (result.affectedRows === 0) {
        console.warn(`상품 ID ${item.productId} 삭제되지 않았습니다.`);
      } else {
        console.log(`상품 ID ${item.productId} 삭제 성공`);
      }
    }

    await connection.commit(); // 트랜잭션 커밋
    return true;
  } catch (error) {
    console.error("장바구니 초기화 실패:", error);
    await connection.rollback(); // 롤백
    return false;
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

// 결제 성공 처리 (POST 요청)
router.post("/success", async (req, res) => {
  const { orderId, paymentKey, amount, userId, cartItems } = req.body;

  console.log("결제 성공 처리 - 요청 데이터:", req.body); // 요청 데이터 확인

  if (!orderId || !userId || !cartItems) {
    return res.status(400).send({ message: "결제 성공 정보가 부족합니다." });
  }

  try {
    console.log("결제 상태 업데이트 시작");
    // 결제 상태 업데이트
    await updatePaymentStatus(orderId, "success");

    console.log("장바구니 삭제 시작");
    // 결제 후 장바구니 항목 삭제
    const isCleared = await clearCart(userId, cartItems);

    if (!isCleared) {
      console.warn("장바구니 초기화 실패.");
      return res.status(500).send({ message: "장바구니 삭제에 실패했습니다." });
    } else {
      console.log("장바구니 초기화 성공");
    }

    // 결제 성공 응답
    res.redirect(
      `http://localhost:3000/api/payment/success?orderId=${orderId}&paymentKey=${paymentKey}&amount=${amount}`
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
