// 환경 변수 설정 및 모듈 불러오기
require("dotenv").config(); // 환경 변수 로드
const express = require("express");
const path = require("path");
const cors = require("cors");
const { dbPromise } = require("./config/db");
const jwt = require("jsonwebtoken"); // JWT 패키지 추가

// 라우터 불러오기
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const profileRoutes = require("./routes/profile");
const paymentRoutes = require("./routes/payment");
const qnaRoutes = require("./routes/qna"); // QnA 라우터 추가
const cartRoutes = require("./routes/cartRoutes");

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());
// 라우터 설정
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/shop", productRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/cart", cartRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/qna", qnaRoutes); // QnA 라우터 연결
app.get("/shop/product/:productId/qna", async (req, res) => {
  const { productId } = req.params;

  try {
    const qnaList = await QnA.findAll({ where: { productId } });
    res.status(200).json({ success: true, data: qnaList });
  } catch (error) {
    console.error("QnA 데이터 조회 오류:", error);
    res
      .status(500)
      .json({ success: false, message: "QnA 데이터를 가져오지 못했습니다." });
  }
});
// QnA 등록 API
app.post("/qna/shop/product/:productId/qna", (req, res) => {
  const { question, userId, userName, productId } = req.body;

  // 필수값 체크
  if (!question || !productId) {
    return res.status(400).json({ message: "질문과 상품 ID는 필수입니다." });
  }

  const query = `
    INSERT INTO qna (question, user_id, user_name, product_id)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    query,
    [question, userId || null, userName || "익명", productId],
    (err, result) => {
      if (err) {
        console.error("QnA 등록 오류:", err);
        return res.status(500).json({ message: "QnA 등록에 실패했습니다." });
      }

      return res
        .status(201)
        .json({ message: "QnA가 등록되었습니다.", qnaId: result.insertId });
    }
  );
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
