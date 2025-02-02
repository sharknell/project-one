const express = require("express");
const { dbPromise } = require("../config/db");
const { authenticateUser } = require("../middleware/authenticateToken");

const router = express.Router();

// ✅ [1] 특정 사용자 QnA 목록 가져오기
router.get("/user/qna", authenticateUser, async (req, res) => {
  const userName = req.user.username;
  console.log("Authenticated user:", userName);

  try {
    const query = `
      SELECT qna.id, qna.question, qna.userName, qna.productId, qna.createdAt, qna.updatedAt, 
             qna.answer, qna.answerCreatedAt, p.image_url AS productImage
      FROM qna
      JOIN products p ON qna.productId = p.id
      WHERE qna.userName = ?
    `;
    const [qnaList] = await dbPromise.query(query, [userName]);

    res.status(200).json({ data: qnaList });
  } catch (error) {
    console.error("QnA 조회 실패:", error);
    res.status(500).json({ message: "QnA 조회 실패" });
  }
});

// ✅ [2] 모든 QnA 목록 가져오기
router.get("/qna", async (req, res) => {
  try {
    const query = `
      SELECT qna.id, qna.question, qna.userName, qna.productId, qna.createdAt, qna.updatedAt, qna.answer, qna.answerCreatedAt,
             p.image_url AS productImage
      FROM qna
      JOIN products p ON qna.productId = p.id
    `;
    const [qnaList] = await dbPromise.query(query);

    res.status(200).json({ data: qnaList });
  } catch (error) {
    console.error("QnA 조회 실패:", error);
    res.status(500).json({ message: "QnA 조회 실패" });
  }
});

// ✅ [3] 특정 QnA의 답변 가져오기 (수정됨)
router.get("/qna/:id/answers", async (req, res) => {
  const { id } = req.params;

  try {
    const query = `SELECT answer, answerCreatedAt FROM qna WHERE id = ?`;
    const [result] = await dbPromise.query(query, [id]);

    if (result.length === 0) {
      return res.status(404).json({ message: "해당 질문을 찾을 수 없습니다." });
    }

    res.status(200).json({ data: result[0].answer ? [result[0]] : [] });
  } catch (error) {
    console.error("답변 조회 실패:", error);
    res.status(500).json({ message: "답변 조회 실패" });
  }
});

// ✅ [4] 답변 저장 (관리자만 가능)
router.post("/qna/answer", authenticateUser, async (req, res) => {
  const { questionId, answer } = req.body;
  const admin = req.user.username;

  if (!questionId || !answer) {
    return res.status(400).json({ message: "질문 ID와 답변을 입력해주세요." });
  }

  try {
    const query = `
      UPDATE qna SET answer = ?, answerCreatedAt = NOW()
      WHERE id = ?
    `;
    const [result] = await dbPromise.query(query, [answer, questionId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "해당 질문을 찾을 수 없습니다." });
    }

    res.status(200).json({ success: true, message: "답변이 저장되었습니다." });
  } catch (error) {
    console.error("QnA 답변 저장 실패:", error);
    res.status(500).json({ message: "답변 저장 실패" });
  }
});

module.exports = router;
