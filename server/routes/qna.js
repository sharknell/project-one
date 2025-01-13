const express = require("express");
const { dbPromise } = require("../config/db");
const { authenticateUser } = require("../middleware/authenticateToken");

const router = express.Router();

// QnA 목록을 사용자별로 가져오는 엔드포인트
router.get("/user/qna", authenticateUser, async (req, res) => {
  const userName = req.user.username; // userName 대신 username 사용 (혹은 반대로 확인)
  console.log("Authenticated userName:", userName); // 인증된 사용자 이름 로그 출력

  try {
    const query = `
      SELECT qna.id, qna.question, qna.userName, qna.productId, qna.createdAt, qna.updatedAt,
             p.image_url AS productImage
      FROM qna
      JOIN products p ON qna.productId = p.id
      WHERE qna.userName = ?
    `;
    const [qnaList] = await dbPromise.query(query, [userName]);
    console.log("QnA List:", qnaList); // 조회된 QnA 리스트 로그 출력
    res.status(200).json({ data: qnaList });
  } catch (error) {
    console.error("QnA 조회 실패:", error);
    res.status(500).json({ message: "QnA 조회 실패" });
  }
});

// QnA 등록 엔드포인트
router.post(
  "/shop/product/:productId/qna",
  authenticateUser,
  async (req, res) => {
    const { productId } = req.params;
    const { question } = req.body;
    const userName = req.user.userName; // 인증된 사용자에서 userName 추출

    // 필드가 하나라도 비어 있으면 400 에러 반환
    if (!question || !userName || !productId) {
      return res.status(400).json({ message: "모든 필드를 입력해주세요." });
    }

    try {
      const query = `
        INSERT INTO qna (question, userName, productId, createdAt, updatedAt)
        VALUES (?, ?, ?, NOW(), NOW())
      `;
      const [result] = await dbPromise.query(query, [
        question,
        userName,
        productId,
      ]);

      res.status(201).json({
        message: "QnA가 등록되었습니다.",
        data: {
          id: result.insertId,
          question,
          userName,
          productId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("QnA 등록 실패:", error);
      res.status(500).json({ message: "QnA 등록 실패" });
    }
  }
);

module.exports = router;
