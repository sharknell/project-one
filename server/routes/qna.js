const express = require("express");
const router = express.Router();
const { dbPromise } = require("../config/db"); // dbPromise 가져오기

// QnA 조회 엔드포인트
router.get("/", async (req, res) => {
  try {
    const [rows] = await dbPromise.query(
      "SELECT * FROM qna ORDER BY createdAt DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("QnA 조회 실패:", err);
    res.status(500).send("서버 오류");
  }
});

// QnA 추가 엔드포인트
router.post("/qna", async (req, res) => {
  try {
    const { question, userName, productId } = req.body;

    if (!question || !userName || !productId) {
      return res.status(400).json({ message: "모든 필드를 입력해주세요." });
    }

    // 데이터베이스에 QnA 저장
    const query = `
      INSERT INTO qna (question, userName, productId, createdAt, updatedAt)
      VALUES (?, ?, ?, NOW(), NOW())
    `;
    const [result] = await dbPromise.query(query, [
      question,
      userName,
      productId,
    ]);

    // 성공적으로 저장된 QnA 데이터를 반환
    res.status(201).json({
      message: "QnA 등록 성공",
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

module.exports = router;
