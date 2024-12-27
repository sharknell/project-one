const express = require("express");
const cors = require("cors");
const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// DB 연결 설정
const { dbPromise } = require("./config/db"); // db.js 임포트

// 라우터 가져오기
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");

// 라우터 설정
app.use("/auth", authRoutes);
app.use("/shop", productRoutes);

// 서버 시작 전에 DB 연결 확인
async function checkDbConnection() {
  try {
    await dbPromise.getConnection(); // DB 연결 확인
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
