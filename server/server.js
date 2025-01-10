const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config(); // 환경 변수 로드

const { dbPromise } = require("./config/db"); // DB 설정
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const profileRoutes = require("./routes/profile");
const paymentRoutes = require("./routes/payment");
const orderlistRoutes = require("./routes/orderlist"); // 주문 내역 라우터 추가
const qnaRoutes = require("./routes/qna"); // QnA 라우터 추가

// 미들웨어 설정
const app = express();
app.use(cors());
app.use(express.json());

// 라우터 설정
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/shop", productRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/profile/orders", orderlistRoutes); // 주문 내역 API 연결
app.use("/qna", qnaRoutes); // QnA 라우터 연결

// QnA 등록 엔드포인트
app.post("/shop/product/:productId/qna", async (req, res) => {
  const { productId } = req.params; // URL 파라미터에서 productId 추출
  const { question, userName } = req.body;

  if (!question || !userName || !productId) {
    return res.status(400).json({ message: "모든 필드를 입력해주세요." });
  }

  try {
    // QnA 데이터를 데이터베이스에 저장
    const query = `
      INSERT INTO qna (question, userName, productId, createdAt, updatedAt)
      VALUES (?, ?, ?, NOW(), NOW())
    `;
    const [result] = await dbPromise.query(query, [
      question,
      userName,
      productId,
    ]);

    console.log(
      `QnA 등록됨: 질문 = ${question}, 작성자 = ${userName}, 상품 ID = ${productId}`
    );

    // 성공적인 응답
    res.status(201).json({
      message: "QnA가 등록되었습니다.",
      data: {
        id: result.insertId,
        question,
        userName,
        productId,
        createdAt: new Date(), // MySQL의 NOW()와 동기화
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("QnA 등록 실패:", error);
    res.status(500).json({ message: "QnA 등록 실패" });
  }
});

// 서버 시작 전에 DB 연결 확인
async function checkDbConnection() {
  try {
    await dbPromise.getConnection();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1); // DB 연결 실패 시 서버 종료
  }
}

checkDbConnection();

// 서버 시작
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
